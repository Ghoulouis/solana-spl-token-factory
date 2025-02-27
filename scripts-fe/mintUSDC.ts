import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { PublicKey, Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import idl from "../target/idl/token_devnet.json"; // Import file IDL
import { getAccount, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as dotenv from "dotenv";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { TokenDevnet } from "../target/types/token_devnet";
dotenv.config();

const CONTROLLER_SEED = "controller";
const PROGRAM_ID_STABLECOIN = "6Y32aZTKjC7GdDkdpyCwPdMP5vPdnuD2siSAKbh16Vwp";
async function main() {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const privateKeyString = process.env.PRIVATE_KEY;
    if (!privateKeyString) {
        throw new Error("PRIVATE_KEY not found in .env");
    }
    const privateKeyBytes = bs58.decode(process.env.PRIVATE_KEY!);
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyBytes));
    const wallet = new anchor.Wallet(keypair);

    // Thiết lập provider
    const provider = new AnchorProvider(connection, wallet, {
        commitment: "confirmed",
    });

    anchor.setProvider(provider);

    const program = new Program(idl as TokenDevnet, provider);

    const controllerPda = PublicKey.findProgramAddressSync([Buffer.from(CONTROLLER_SEED)], program.programId)[0];

    const amount = 1e6;

    const usdcPda = PublicKey.findProgramAddressSync([Buffer.from("USDC")], new PublicKey(PROGRAM_ID_STABLECOIN))[0];
    const accountATA = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.payer,
        usdcPda,
        wallet.publicKey,
        true
    );
    console.log(" USDC Pda = ", usdcPda.toBase58());

    const txHash = await program.methods
        .mint(new anchor.BN(amount))
        .accountsPartial({
            signer: wallet.publicKey,
            controller: controllerPda,
            token: usdcPda,
            signerAta: accountATA.address,
        })
        .signers([wallet.payer])
        .rpc();

    console.log("Transaction hash:", txHash);

    console.log(`View transaction on Solana Explorer: https://solscan.io/tx/${txHash}?cluster=devnet`);

    // const balance = await getAccount(connection, accountATA.address);
    // console.log("Balance USDC:", balance.amount.toString());
}
main().catch((err) => {
    console.error("Error:", err);
});
