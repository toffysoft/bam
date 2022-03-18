package main

import (
	"github.com/toffysoft/bam/consts"
	"github.com/toffysoft/bam/services"
)

func main() {
	cfg := consts.NewConfig()
	services.NewWriter(cfg).Write()
}
