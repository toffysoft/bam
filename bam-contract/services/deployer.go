package services

import (
	"os"

	"github.com/toffysoft/bam/bindings/bam"

	"github.com/toffysoft/bam/consts"
	"github.com/toffysoft/bam/utils"
)

type Deployer struct {
	cfg consts.IConfig
}

func NewDeployer(cfg consts.IConfig) *Deployer {
	return &Deployer{
		cfg: cfg,
	}
}

func (svc *Deployer) Deploy() error {
	cfg := svc.cfg
	network := cfg.Network()

	client, err := consts.GetClient(cfg.Network())
	if err != nil {
		return utils.LogE(err)
	}

	// 1. Deploy TokenA contract
	bamfersAddr, _, _, err := bam.DeployBam(utils.MySendOpt(client, network), client, os.Getenv("PREFIX_URI"))
	if err != nil {
		return utils.LogE(err)
	}

	// 4. Print address of all contract to used later
	utils.Print(`BAMfers_ADDR=%s \`, bamfersAddr.String())

	return nil
}
