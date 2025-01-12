// src/entities/wallet-state.entity.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { BalanceEntriesEntity } from "./balance-entries.entity";

@Entity({ name: "wallet_states" })
export class WalletState {
  /**
   * Primary Key: Unique identifier for the wallet owner.
   * Assuming 'owner' is a unique identifier (e.g., user ID or Solana wallet owner ID).
   */
  @PrimaryColumn({ type: "varchar", length: 44 })
  owner: string;

  /**
   * Solana Wallet Address.
   * It's advisable to enforce uniqueness if each owner has a unique address.
   */
  @Column({ type: "varchar", length: 44, unique: true })
  address: string;

  /**
   * Amount of the specific token held by the wallet.
   * Using 'numeric' type for precise decimal representation.
   */
  @Column({ type: "numeric", precision: 20, scale: 8, default: 0 })
  amount: number;

  /**
   * Eligibility Percentage for the airdrop.
   */
  @Column({ type: "numeric", precision: 4, scale: 2, default: 0 })
  eligibilityPercentage: number;

  /**
   * Eligibility Status for the airdrop.
   * True if eligible, false otherwise.
   */
  @Column({ type: "boolean", default: false })
  eligible: boolean;

  /**
   * Timestamp when the wallet state was created.
   */
  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  /**
   * Timestamp when the wallet state was last updated.
   */
  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;

  /**
   * One-to-Many relationship with BalanceEntriesEntity.
   * Each wallet state can have multiple balance entries.
   */
  @OneToMany(
    () => BalanceEntriesEntity,
    (balanceEntriesEntity) => balanceEntriesEntity.owner,
  )
  balanceEntriesEntities: BalanceEntriesEntity[];
}
