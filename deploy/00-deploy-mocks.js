const {network} = require("hardhat");
const {developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (chainId == "31337") {
        log("Local network detected! Release the mocks!!")
    
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        log("Mocks Unleashed")
        log("_______________________________")
    }
}

module.exports.tags = ["all", "mocks"]