-- CreateTable
CREATE TABLE "notification_recipients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_recipient_exclusions" (
    "id" TEXT NOT NULL,
    "recurring_event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_recipient_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_recipients_organization_id_idx" ON "notification_recipients"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipients_organization_id_user_id_key" ON "notification_recipients"("organization_id", "user_id");

-- CreateIndex
CREATE INDEX "event_recipient_exclusions_recurring_event_id_idx" ON "event_recipient_exclusions"("recurring_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_recipient_exclusions_recurring_event_id_user_id_key" ON "event_recipient_exclusions"("recurring_event_id", "user_id");

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_recipients" ADD CONSTRAINT "notification_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_recipient_exclusions" ADD CONSTRAINT "event_recipient_exclusions_recurring_event_id_fkey" FOREIGN KEY ("recurring_event_id") REFERENCES "recurring_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_recipient_exclusions" ADD CONSTRAINT "event_recipient_exclusions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
