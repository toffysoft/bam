package services

import (
	"fmt"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/toffysoft/bam/bindings/bam"
	"github.com/toffysoft/bam/consts"
	"github.com/toffysoft/bam/utils"
)

type Reader struct {
	cfg consts.IConfig
}

func NewReader(cfg consts.IConfig) *Reader {
	return &Reader{
		cfg: cfg,
	}
}

func (svc *Reader) Read() error {
	cfg := svc.cfg

	client, err := consts.GetClient(cfg.Network())
	if err != nil {
		return utils.LogE(err)
	}

	// 1. Create ThePool contract using address from ENV
	bamContract, err := bam.NewBam(cfg.AddressOfToken(), client)
	if err != nil {
		return utils.LogE(err)
	}

	t, err := bamContract.TotalSupply(&bind.CallOpts{})
	if err != nil {
		return utils.LogE(err)
	}

	fmt.Println("TotalSupply", t.String())

	// addr, err := utils.MyAccountAddress(client, cfg.Network())
	// if err != nil {
	// 	return utils.LogE(err)
	// }

	// a, err := bamContract.GetAux(&bind.CallOpts{}, addr)
	// if err != nil {
	// 	return utils.LogE(err)
	// }

	// fmt.Println("GetAux", a)

	return nil
}
