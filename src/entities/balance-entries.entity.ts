// src/entities/airdrop-eligibility.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { WalletState } from "./wallet-state.entity";

@Entity({ name: "balance_entries" })
export class BalanceEntriesEntity {
  /**
   * Primary Key: Unique identifier for each airdrop eligibility record.
   */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /**
   * Foreign Key: References the owner in WalletState.
   * Establishes the relationship to the WalletState entity.
   */
  @Column({ type: "varchar", length: 44 })
  owner: string;
  /**
   * Solana Wallet Address.
   * This can be redundant if the `walletState` already contains the address.
   * Including it here for quick access or denormalization purposes.
   */
  @Column({ type: "varchar", length: 44 })
  address: string;

  /**
   * Balance of the specific token at the time of eligibility check.
   */
  @Column({ type: "numeric", precision: 20, scale: 8, default: 0 })
  balance: number;

  /**
   * Eligibility Status for the airdrop.
   * True if eligible, false otherwise.
   */
  @Column({ type: "boolean", default: false })
  eligible: boolean;

  /**
   * Eligibility Percentage for the airdrop.
   */
  @Column({ type: "numeric", precision: 4, scale: 2, default: 0 })
  eligibilityPercentage: number;

  /**
   * Timestamp when the airdrop eligibility record was created.
   */
  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  /**
   * Timestamp when the airdrop eligibility record was last updated.
   */
  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;

  /**
   * Many-to-One relationship with WalletState.
   * Each balance entry belongs to a single wallet state.
   */
  @ManyToOne(() => WalletState, (walletState) => walletState.owner)
  @JoinColumn({ name: "owner" })
  walletState: WalletState;
}
