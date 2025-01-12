import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1736076862043 implements MigrationInterface {
  name = "InitMigration1736076862043";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "balance_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner" character varying(44) NOT NULL, "address" character varying(44) NOT NULL, "balance" numeric(20,8) NOT NULL DEFAULT '0', "eligible" boolean NOT NULL DEFAULT false, "eligibilityPercentage" numeric(4,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_048c08cbd9ace901924a3f794ce" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_states" ("owner" character varying(44) NOT NULL, "address" character varying(44) NOT NULL, "amount" numeric(20,8) NOT NULL DEFAULT '0', "eligibilityPercentage" numeric(4,2) NOT NULL DEFAULT '0', "eligible" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_4bf1c50907bd299df6945b4adff" UNIQUE ("address"), CONSTRAINT "PK_4d8eeeedecfa987ac92392721d6" PRIMARY KEY ("owner"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "balance_entries" ADD CONSTRAINT "FK_c791175b730f06fb287750ee6c3" FOREIGN KEY ("owner") REFERENCES "wallet_states"("owner") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "balance_entries" DROP CONSTRAINT "FK_c791175b730f06fb287750ee6c3"`,
    );
    await queryRunner.query(`DROP TABLE "wallet_states"`);
    await queryRunner.query(`DROP TABLE "balance_entries"`);
  }
}
