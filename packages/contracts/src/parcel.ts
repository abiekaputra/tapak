// Module responsible for defining validated parcel and journey contracts.
import { z } from 'zod';

export const parcelStatusSchema = z.enum([
  'CREATED',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
]);

export const journeyEventTypeSchema = z.enum(['PICKUP', 'TRANSIT', 'DELIVERY']);

export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().positive().max(10_000).optional(),
});

export const createParcelSchema = z.object({
  recipientName: z.string().trim().min(2).max(80),
  recipientAddress: z.string().trim().min(8).max(240),
  recipientPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 -]{8,18}$/u),
  courierId: z.string().uuid(),
});

export const journeyEventSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    type: journeyEventTypeSchema,
    coordinates: coordinateSchema,
    capturedAt: z.string().datetime({ offset: true }),
    note: z.string().trim().max(240).optional(),
    recipientName: z.string().trim().min(2).max(80).optional(),
  })
  .superRefine((event, context) => {
    if (event.type === 'DELIVERY' && !event.recipientName) {
      context.addIssue({
        code: 'custom',
        message: 'Recipient name is required for delivery proof.',
        path: ['recipientName'],
      });
    }
  });

export type ParcelStatus = z.infer<typeof parcelStatusSchema>;
export type JourneyEventType = z.infer<typeof journeyEventTypeSchema>;
export type Coordinate = z.infer<typeof coordinateSchema>;
export type CreateParcelInput = z.infer<typeof createParcelSchema>;
export type JourneyEventInput = z.infer<typeof journeyEventSchema>;

export interface JourneyEvent {
  id: string;
  parcelId: string;
  type: JourneyEventType;
  coordinates: Coordinate;
  capturedAt: string;
  recordedAt: string;
  note?: string;
  recipientName?: string;
}

export interface Parcel {
  id: string;
  code: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  courierId: string;
  courierName: string;
  status: ParcelStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  events: JourneyEvent[];
}
