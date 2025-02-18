import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1739915104667 implements MigrationInterface {
    name = 'InitialSchema1739915104667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "account" ("id" SERIAL NOT NULL, "ownerId" integer NOT NULL, "balanceGalleons" numeric(10,2) NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "account"`);
    }

}
