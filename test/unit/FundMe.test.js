const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
require("@nomiclabs/hardhat-waffle");

describe('FundMe', async () => { 
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1") //1 ETH
    beforeEach(async function () {
        //deploy fundMe contract with hardhat-deploy
        //const account = await ethers.getSigners();
        //const accountZero = accounts[0]

        deployer = (await getNamedAccounts()).deployer
        //console.log(deployer)
        await deployments.fixture(["all"])
        
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })
    describe("constructor", async function () {
        it("sets the aggregator address correctly", async () => {
            //console.log("got here")
            const response = await fundMe.priceFeed();
            //console.log("then here...")
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe('fund', () => { 
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH brokie!")
        })
        it("Updates the amount funded data structure", async function () {
            //const initfund = await fundMe.addressToAmountFunded[deployer]
            
            await fundMe.fund({ value: sendValue })
            const finalFund = await fundMe.addressToAmountFunded(deployer)
            assert.equal(finalFund.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
     })
     describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single founder", async function () {
            const startingFundBalance = await fundMe.provider.getBalance( fundMe.address )
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundBalance.add(startingDeployerBalance).toString(),
                        endingDeployerBalance.add(gasCost).toString())
        })
     })
    
 })