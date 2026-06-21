import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20)
});

export const patchCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20)
});

export const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  address: z.string().min(5)
});

export const verifySchema = z.object({
  taskId: z.string().min(1),
  expect: z
    .object({
      cartQuantity: z.number().int().optional(),
      diet: z.string().optional(),
      category: z.string().optional(),
      maxPriceEach: z.number().optional(),
      minRating: z.number().optional()
    })
    .optional()
});
