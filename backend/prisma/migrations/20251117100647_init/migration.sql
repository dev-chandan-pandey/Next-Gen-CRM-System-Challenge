-- AlterTable
CREATE SEQUENCE meta_id_seq;
ALTER TABLE "Meta" ALTER COLUMN "id" SET DEFAULT nextval('meta_id_seq');
ALTER SEQUENCE meta_id_seq OWNED BY "Meta"."id";

-- CreateTable
CREATE TABLE "SlackUser" (
    "id" SERIAL NOT NULL,
    "slackId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlackUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SlackUser_slackId_key" ON "SlackUser"("slackId");

-- AddForeignKey
ALTER TABLE "SlackUser" ADD CONSTRAINT "SlackUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
