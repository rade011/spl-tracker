// src/wallet/wallet.service.ts

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WalletState } from "../entities/wallet-state.entity";
import { Repository } from "typeorm";
import { BalanceEntriesEntity } from "../entities/balance-entries.entity";
import { HeliusClient } from "../common/clients/helius.client";
import { CreateWalletDto } from "./dto/create-wallet.dto";
import { UpdateWalletDto } from "./dto/update-wallet.dto";

const TOKEN_DECIMALS = 5;

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(WalletState)
    private readonly walletRepository: Repository<WalletState>,

    @InjectRepository(BalanceEntriesEntity)
    private readonly balanceEntriesRepository: Repository<BalanceEntriesEntity>,

    private readonly heliusClient: HeliusClient,
  ) {}


  /**
   * Retrieves all wallet entries from the database.
   * @returns An array of WalletState entities.
   */

  async getAllWallets(): Promise<WalletState[]> {
    try {
      return await this.walletRepository.find();
    } catch (error) {
      this.logger.error(`Failed to fetch wallets: ${error.message}`);
      throw new InternalServerErrorException("Unable to fetch wallets.");
    }
  }

  /**
   * Retrieves a single wallet entry from the database.
   * @param owner - The owner of the wallet.
   * @returns The WalletState entity.
   */
  async getWallet(owner: string): Promise<BalanceEntriesEntity[]> {
    const balanceEntry = await this.balanceEntriesRepository.find({ where: { owner } });
    if (!balanceEntry) {
      throw new NotFoundException("balanceEntry for this owner not found.");
    }
    return balanceEntry;
  }

  /**
   * Creates a new wallet entry in the database.
   * @param createWalletDto - Data Transfer Object containing wallet details.
   * @returns The created WalletState entity.
   */
  async createWallet(createWalletDto: CreateWalletDto): Promise<WalletState> {
    const wallet = this.walletRepository.create(createWalletDto);
    try {
      return await this.walletRepository.save(wallet);
    } catch (error) {
      this.logger.error(`Failed to create wallet: ${error.message}`);
      throw new InternalServerErrorException("Unable to create wallet.");
    }
  }

  /**
   * Retrieves all SPL accounts with addresses and balaces.
   * @returns An array of Owners addresses and balances from solana.
   */
  async getAllAccounts(): Promise<WalletState[]> {
    try {
      const wallets = await this.heliusClient.getTokenAccounts(
        "9yNEs1Z96EF4Y5NTufU9FyRAz6jbGzZLBfRQCtssPtAQ",
        1000,
      );

      return wallets;
    } catch (error) {
      console.log("Error_______________", error);
      this.logger.error(`Failed to fetch wallets: ${error.message}`);
      throw new InternalServerErrorException("Unable to fetch wallets.");
    }
  }

  /**
   * Processes the Helius API response and updates the database.
   * - Updates or creates WalletState entries.
   * - Creates BalanceEntriesEntity snapshots.
   * @param wallets - Array of wallet data from Helius API.
   */
  async processAndStoreWallets(wallets: any[]): Promise<void> {
    for (const walletData of wallets) {
      const { owner, address, amount, frozen } = walletData;

      // Convert amount from smallest unit to standard unit
      const standardAmount = Number(amount) / Math.pow(10, TOKEN_DECIMALS);
      const eligibleAmount =
        Number(standardAmount) / Math.pow(10, TOKEN_DECIMALS);

      // Calculate eligibility percentage without underscores
      const eligibilityPercentage =
        this.calculateEligibilityPercentage(standardAmount);

      // Determine eligibility status
      const isEligible = eligibilityPercentage > 0;

      // Upsert WalletState
      let walletState = await this.walletRepository.findOne({
        where: { owner },
      });

      if (walletState) {
        // Update existing WalletState
        walletState.amount = standardAmount;
        walletState.eligibilityPercentage = eligibilityPercentage;
        walletState.eligible = isEligible;
        await this.walletRepository.save(walletState);
      } else {
        // Create new WalletState
        walletState = this.walletRepository.create({
          owner,
          address,
          amount: standardAmount,
          eligibilityPercentage: eligibilityPercentage,
          eligible: isEligible,
        });
        await this.walletRepository.save(walletState);
      }

      // Create BalanceEntriesEntity snapshot
      const balanceEntry = this.balanceEntriesRepository.create({
        owner,
        address,
        balance: standardAmount,
        eligibilityPercentage: eligibilityPercentage,
        eligible: isEligible,
      });
      await this.balanceEntriesRepository.save(balanceEntry);
    }
  }

  // src/wallet/wallet.service.ts

  private calculateEligibilityPercentage(amount: number): number {
    if (amount < 20999) {
      return 0;
    } else if (amount >= 21000 && amount <= 41999) {
      return 0.1;
    } else if (amount >= 42000 && amount <= 62999) {
      return 0.2;
    } else if (amount >= 63000 && amount <= 83999) {
      return 0.3;
    } else if (amount >= 84000 && amount <= 104999) {
      return 0.4;
    } else if (amount >= 105000 && amount <= 125999) {
      return 0.5;
    } else if (amount >= 126000 && amount <= 146999) {
      return 0.6;
    } else if (amount >= 147000 && amount <= 167999) {
      return 0.7;
    } else if (amount >= 168000 && amount <= 188999) {
      return 0.8;
    } else if (amount >= 189000 && amount <= 209999) {
      return 0.9;
    } else if (amount >= 210000 && amount <= 230999) {
      return 1.0;
    } else {
      return 1.0; // For amounts above 231,000
    }
  }
}
