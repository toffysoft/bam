package utils

import (
	"context"
	"errors"
	"fmt"
	"io"
	"math/big"
	"os"
	"os/exec"
	"runtime"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	hdwallet "github.com/miguelmota/go-ethereum-hdwallet"
	"github.com/shopspring/decimal"
	"github.com/toffysoft/bam/consts"
)

func Print(format string, val ...interface{}) {
	fmt.Printf(format+"\n", val...)
}

func LogE(err error) error {
	if err != nil {
		_, fn, line, _ := runtime.Caller(1)
		fmt.Println(err.Error(), fmt.Sprintf("%s:%d", fn, line))
	}
	return err
}

func LogM(msg string) {
	fmt.Println(msg)
}

// FromWei wei to decimals
func FromWei(ivalue interface{}) decimal.Decimal {
	value := new(big.Int)
	switch v := ivalue.(type) {
	case string:
		value.SetString(v, 10)
	case *big.Int:
		value = v
	default:
		value.SetString(fmt.Sprintf("%v", v), 10)
	}

	mul := decimal.NewFromFloat(float64(10)).Pow(decimal.NewFromFloat(float64(18)))
	num, _ := decimal.NewFromString(value.String())
	result := num.Div(mul)

	return result
}

func ToBasis(percent float32) *big.Int {
	basis := int64(percent * 100)
	wei := new(big.Int)
	wei.SetInt64(basis)
	return wei
}

// ToWei decimals to wei
func ToWei(iamount interface{}) *big.Int {
	amount := decimal.NewFromFloat(0)
	switch v := iamount.(type) {
	case string:
		amount, _ = decimal.NewFromString(v)
	case float32:
		amount = decimal.NewFromFloat(float64(v))
	case float64:
		amount = decimal.NewFromFloat(v)
	case int:
		amount = decimal.NewFromFloat(float64(v))
	case int32:
		amount = decimal.NewFromFloat(float64(v))
	case int64:
		amount = decimal.NewFromFloat(float64(v))
	case decimal.Decimal:
		amount = v
	case *decimal.Decimal:
		amount = *v
	default:
		amount, _ = decimal.NewFromString(fmt.Sprintf("%v", v))
	}

	mul := decimal.NewFromFloat(float64(10)).Pow(decimal.NewFromFloat(float64(18)))
	result := amount.Mul(mul)

	wei := new(big.Int)
	wei.SetString(result.String(), 10)

	return wei
}

func MyAccountPath(network consts.Network) string {
	return fmt.Sprintf("m/44'/60'/0'/0/%d", 0)
}

func MyAccountAddress(client *ethclient.Client, network consts.Network) (common.Address, error) {
	myWallet, err := MyWallet(network)
	if err != nil {
		return consts.AddressZero(), LogE(err)
	}

	path := hdwallet.MustParseDerivationPath(MyAccountPath(network))
	myAccount, err := myWallet.Derive(path, false)
	if err != nil {
		return consts.AddressZero(), LogE(err)
	}
	addr, err := myWallet.Address(myAccount)
	if err != nil {
		return consts.AddressZero(), LogE(err)
	}
	return addr, nil
}

func MySendOpt(client *ethclient.Client, network consts.Network) *bind.TransactOpts {
	myWallet, err := MyWallet(network)
	if err != nil {
		LogE(err)
		return nil
	}
	path := hdwallet.MustParseDerivationPath(MyAccountPath(network))
	myAccount, err := myWallet.Derive(path, false)
	if err != nil {
		LogE(err)
		return nil
	}
	privateKey, err := myWallet.PrivateKey(myAccount)
	if err != nil {
		LogE(err)
		return nil
	}

	nonce, err := client.PendingNonceAt(context.Background(), myAccount.Address)
	if err != nil {
		LogE(err)
		return nil
	}

	chainID, err := client.ChainID(context.Background())
	if err != nil {
		LogE(err)
		return nil
	}
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		LogE(err)
		return nil
	}

	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0) // wei
	if network == consts.GanacheCLI {
		auth.GasLimit = uint64(6721975)
	} else {
		auth.GasLimit = uint64(8000000)
	}

	gasPrice, err := client.SuggestGasPrice(context.Background())
	if err != nil {
		LogE(err)
	}
	auth.GasPrice = gasPrice

	return auth
}

func MySendOptWithValue(auth *bind.TransactOpts, price *big.Int) *bind.TransactOpts {

	auth.Value = price
	return auth
}

func MyWallet(network consts.Network) (*hdwallet.Wallet, error) {
	mnemonic := ""
	if network == consts.GanacheCLI {
		mnemonic = os.Getenv("SEED_GANACHE")
	} else if network == consts.BSCTest {
		mnemonic = os.Getenv("SEED_BSCTEST")
	} else if network == consts.BSCMain {
		mnemonic = os.Getenv("SEED_BSCMAIN")
	}
	wallet, err := hdwallet.NewFromMnemonic(mnemonic)
	if err != nil {
		return nil, LogE(err)
	}

	return wallet, nil
}

func Reveal(tokenID int) string {
	if os.Getenv("REVEAL_SCRIPT_PATH") == "" {
		return "no REVEAL_SCRIPT_PATH"
	}

	matadata := fmt.Sprintf("%s/%d", os.Getenv("METADATA_PATH"), tokenID)
	cmd, err := exec.Command("/bin/sh", os.Getenv("REVEAL_SCRIPT_PATH"), matadata).Output()
	if err != nil {
		fmt.Printf("error %s", err)
	}
	output := string(cmd)
	return output
}

func ensureDir(dirName string) error {
	err := os.Mkdir(dirName, os.ModeDir)
	if err == nil {
		return nil
	}
	if os.IsExist(err) {
		// check that the existing path is a directory
		info, err := os.Stat(dirName)
		if err != nil {
			return err
		}
		if !info.IsDir() {
			return errors.New("path exists but is not a directory")
		}
		return nil
	}
	return err
}

func Copy(src, dst string) (int64, error) {
	sourceFileStat, err := os.Stat(src)
	if err != nil {
		return 0, err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return 0, fmt.Errorf("%s is not a regular file", src)
	}

	source, err := os.Open(src)
	if err != nil {
		return 0, err
	}
	defer source.Close()

	err = ensureDir(os.Getenv("PUBLIC_PATH"))
	if err != nil {
		return 0, err
	}

	destination, err := os.Create(dst)
	if err != nil {
		return 0, err
	}
	defer destination.Close()
	nBytes, err := io.Copy(destination, source)
	return nBytes, err
}
