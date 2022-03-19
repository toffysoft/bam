package services

import (
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/toffysoft/bam/bindings/bam"
	"github.com/toffysoft/bam/consts"
	"github.com/toffysoft/bam/utils"
)

type Writer struct {
	cfg consts.IConfig
}

func NewWriter(cfg consts.IConfig) *Writer {
	return &Writer{
		cfg: cfg,
	}
}

func (svc *Writer) Write() error {
	cfg := svc.cfg
	network := cfg.Network()

	client, err := consts.GetClient(cfg.Network())
	if err != nil {
		return utils.LogE(err)
	}

	// 1. Create TokenA contrat and approve 1ml tokens
	bamContract, err := bam.NewBam(cfg.AddressOfToken(), client)
	if err != nil {
		return utils.LogE(err)
	}

	myAddr, err := utils.MyAccountAddress(client, network)
	if err != nil {
		return utils.LogE(err)
	}
	utils.Print("My myAddr = %s", myAddr)

	totalSupply, err := bamContract.TotalSupply(&bind.CallOpts{})
	if err != nil {
		return utils.LogE(err)
	}
	utils.Print("TotalSupply = %s", totalSupply)

	cost, err := bamContract.BAMFERSPRICE(&bind.CallOpts{})
	if err != nil {
		return utils.LogE(err)
	}
	utils.Print("Cost = %s", cost)

	_, err = bamContract.Mint(utils.MySendOptWithValue(utils.MySendOpt(client, network), cost), big.NewInt(1))
	if err != nil {
		return utils.LogE(err)
	}

	totalSupply, err = bamContract.TotalSupply(&bind.CallOpts{})
	if err != nil {
		return utils.LogE(err)
	}
	utils.Print("TotalSupply = %s", totalSupply)

	_, err = bamContract.FreeMint(utils.MySendOpt(client, network), big.NewInt(0))
	if err != nil {
		return utils.LogE(err)
	}

	return nil
}
