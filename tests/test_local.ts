import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Signer } from "@solana/web3.js";
import { TokenDevnet } from "../target/types/token_devnet";
import { Account, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { expect, use } from "chai";

anchor.setProvider(anchor.AnchorProvider.env());
const provider = anchor.AnchorProvider.env();
let controllerPda: PublicKey;
let redeemableMintPda: PublicKey;
const CONTROLLER_SEED = "controller";
const REDEEMABLE_MINT_SEED = "REDEEMABLE";
(async () => {
    let owner = new Wallet(anchor.web3.Keypair.generate());
    let user = new Wallet(anchor.web3.Keypair.generate());
    let agent = new Wallet(anchor.web3.Keypair.generate());
    let userRedeemATA: PublicKey;

    const program = anchor.workspace.TokenDevnet as Program<TokenDevnet>;

    const provider = anchor.AnchorProvider.env();

    let controllerPda: PublicKey;
    let userATA: PublicKey;
    let tokenPda: PublicKey;
    console.log("Program ID", program.programId.toBase58());
    describe("Integration tests", async function () {
        before("Initialize Lending program", async function () {
            const airdropSig = await provider.connection.requestAirdrop(user.publicKey, 100 * LAMPORTS_PER_SOL);
            await provider.connection.confirmTransaction(airdropSig);
            const airdropSig2 = await provider.connection.requestAirdrop(owner.publicKey, 100 * LAMPORTS_PER_SOL);
            await provider.connection.confirmTransaction(airdropSig2);
            await provider.connection.confirmTransaction(
                await provider.connection.requestAirdrop(agent.publicKey, 100 * LAMPORTS_PER_SOL)
            );
            controllerPda == PublicKey.findProgramAddressSync([Buffer.from(CONTROLLER_SEED)], program.programId)[0];
        });
        it("create token", async function () {
            let symbol = "USDC";
            tokenPda = PublicKey.findProgramAddressSync([Buffer.from(symbol)], program.programId)[0];
            await program.methods
                .create(symbol, 6)
                .accountsPartial({
                    signer: user.publicKey,
                    controller: controllerPda,
                    token: tokenPda,
                })
                .signers([user.payer])
                .rpc();

            userATA = await getAssociatedTokenAddress(tokenPda, user.publicKey);

            console.log("User ATA", userATA.toBase58());
        });
        it("mint test", async function () {
            let amount = new anchor.BN(1e6);

            //   let balanceBefore = await getAccount(provider.connection, userATA);
            await program.methods
                .mint(amount)
                .accountsPartial({
                    signer: user.publicKey,
                    controller: controllerPda,
                    token: tokenPda,
                    signerAta: userATA,
                })
                .signers([user.payer])
                .rpc();
            let balanceAfter = await getAccount(provider.connection, userATA);

            expect(balanceAfter.amount).to.equal(BigInt(amount.toNumber()));
        });

        xit("create another token", async function () {
            let symbol = "USDT";
            tokenPda = PublicKey.findProgramAddressSync([Buffer.from(symbol)], program.programId)[0];
            await program.methods
                .create(symbol, 6)
                .accountsPartial({
                    signer: user.publicKey,
                    controller: controllerPda,
                    token: tokenPda,
                })
                .signers([user.payer])
                .rpc();
        });
        this.afterAll("Transfer funds back to bank", async function () {});
    });
})();
