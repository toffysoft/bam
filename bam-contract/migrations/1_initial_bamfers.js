const BAMfers = artifacts.require('BAMfers');

module.exports = function (deployer, network, accounts) {
  deployer.deploy(
    BAMfers,
    // process.env.PREFIX_URI,
    // '',
    // process.env.HIDDEN_URI,
  );
};
