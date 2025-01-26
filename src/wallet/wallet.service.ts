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
  private readonly TOTAL_COIN_SUPPLY: number = 21000000; // 21,000,000,000
  private readonly DYNAMIC_THRESHOLD: number = 231000;

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

  /**
   * Calculates the eligibility percentage based on the amount of coins held.
   *
   * - For amounts <= 231,000, returns predefined percentages.
   * - For amounts > 231,000, calculates the percentage based on total coin supply.
   *
   * @param amount - The amount of coins held by the user.
   * @returns The eligibility percentage as a number on a 0 to 100 scale.
   * @throws Will throw an error if the amount is not a valid number or is negative.
   */
  private calculateEligibilityPercentage(amount: number): number {
    // Input Validation
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number.');
    }

    if (amount < 0) {
      throw new Error('Amount cannot be negative.');
    }

    const tiers = [
      { min: 210000, max: 230999, percentage: 1.0 },
      { min: 189000, max: 209999, percentage: 0.9 },
      { min: 168000, max: 188999, percentage: 0.8 },
      { min: 147000, max: 167999, percentage: 0.7 },
      { min: 126000, max: 146999, percentage: 0.6 },
      { min: 105000, max: 125999, percentage: 0.5 },
      { min: 84000, max: 104999, percentage: 0.4 },
      { min: 63000, max: 83999, percentage: 0.3 },
      { min: 42000, max: 62999, percentage: 0.2 },
      { min: 21000, max: 41999, percentage: 0.1 },
      { min: 0, max: 20999, percentage: 0 },
    ];

    if (amount > this.DYNAMIC_THRESHOLD) {
      // Calculate percentage based on total coin supply
      let percentage = (amount / this.TOTAL_COIN_SUPPLY) * 100; // Convert to percentage
      // Cap the percentage at 100%
      percentage = percentage > 100 ? 100 : parseFloat(percentage.toFixed(4)); // Rounded to 4 decimal places
      return percentage;
    }

    const matchingTier = tiers.find(tier => amount >= tier.min && amount <= tier.max);
    return matchingTier ? matchingTier.percentage : 0;
  }

}
