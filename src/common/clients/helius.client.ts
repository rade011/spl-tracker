// src/common/clients/helius.client.ts

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

@Injectable()
export class HeliusClient {
  private readonly logger = new Logger(HeliusClient.name);
  private readonly baseUrl: string = "https://mainnet.helius-rpc.com"; // Helius API Base URL

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetches token accounts for a specific mint address with pagination.
   * @param mintAddress - The token's mint address.
   * @param limit - Number of records per page.
   * @returns Array of token accounts.
   */
  async getTokenAccounts(
    mintAddress: string,
    limit: number = 1000,
  ): Promise<any[]> {
    const apiKey = this.configService.get<string>("HELIUS_API_KEY");
    if (!apiKey) {
      throw new InternalServerErrorException(
        "Helius API key is not configured.",
      );
    }

    // const url = "https://mainnet.helius-rpc.com/?api-key=d596d19c-c8f4-40ff-a157-cfb534f72d6b";
    const url = `${this.baseUrl}/?api-key=${apiKey}`;
    let page = 1;
    let hasMore = true;
    const allTokenAccounts = [];

    while (hasMore) {
      const body = {
        jsonrpc: "2.0",
        method: "getTokenAccounts",
        id: `helius-test-${page}`,
        params: {
          page,
          limit,
          displayOptions: {},
          mint: mintAddress,
        },
      };

      try {
        const response$ = this.httpService.post(url, body, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const response = await firstValueFrom(response$);
        const data = response.data;

        if (data.error) {
          this.logger.error(`Helius API Error: ${JSON.stringify(data.error)}`);
          throw new InternalServerErrorException(
            "Error fetching token accounts from Helius API.",
          );
        }

        const accounts = data.result?.token_accounts || [];
        allTokenAccounts.push(...accounts);

        // Determine if there are more pages
        hasMore = accounts.length === limit;
        page += 1;
      } catch (error) {
        this.logger.error(
          `Failed to fetch token accounts on page ${page}: ${error.message}`,
        );
        throw new InternalServerErrorException(
          "Unable to fetch token accounts from Helius API.",
        );
      }
    }

    return allTokenAccounts;
  }

  /**
   * Example method to fetch and log token accounts.
   * Replace or extend with actual business logic as needed.
   * @param mintAddress - The token's mint address.
   */
  async fetchAndProcessTokenAccounts(mintAddress: string): Promise<void> {
    const tokenAccounts = await this.getTokenAccounts(mintAddress);
    // Process tokenAccounts as needed, e.g., save to database
    this.logger.log(
      `Fetched ${tokenAccounts.length} token accounts for mint: ${mintAddress}`,
    );
    // Example: Iterate and log each account
    tokenAccounts.forEach((account, index) => {
      this.logger.log(`Account ${index + 1}: ${JSON.stringify(account)}`);
    });
  }

  // Add more methods as needed to interact with other Helius API endpoints
}
