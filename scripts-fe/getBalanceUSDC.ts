import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { PublicKey, Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import idl from "../target/idl/token_devnet.json"; // Import file IDL
import { getAccount, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import * as dotenv from "dotenv";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
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

    const usdcPda = PublicKey.findProgramAddressSync([Buffer.from("USDC")], new PublicKey(PROGRAM_ID_STABLECOIN))[0];

    console.log(" USDC Pda = ", usdcPda.toBase58());
    const mintAccountInfo = await connection.getAccountInfo(usdcPda);
    if (!mintAccountInfo) {
        throw new Error(`Mint at ${usdcPda.toBase58()} does not exist. Run the 'create' function first.`);
    } else {
    }
    const accountATA = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.payer,
        usdcPda,
        wallet.publicKey,
        true
    );
    console.log("Account ATA = ", accountATA.address.toBase58());
    const balance = await getAccount(connection, accountATA.address);
    console.log("Balance USDC:", balance.amount.toString());
}
main().catch((err) => {
    console.error("Error:", err);
});
