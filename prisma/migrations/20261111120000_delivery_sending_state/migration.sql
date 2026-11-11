-- Add a transient 'SENDING' state to DeliveryStatus so the dispatcher can claim a delivery,
-- send it, and only then mark it 'SENT'. A crash between claim and send leaves the row
-- 'SENDING'; the next dispatch sweeps stale 'SENDING' rows back to 'SCHEDULED' and retries.
ALTER TYPE "DeliveryStatus" ADD VALUE IF NOT EXISTS 'SENDING';
