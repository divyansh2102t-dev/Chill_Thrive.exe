ALTER TABLE bookings
DROP COLUMN booking_time;

ALTER TABLE bookings
ADD CONSTRAINT bookings_slot_fk
FOREIGN KEY (slot_id)
REFERENCES slot_timings(id)
ON DELETE RESTRICT;