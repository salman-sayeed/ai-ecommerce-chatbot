import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ["t-shirt", "pants"] },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // URL string
    sizes: { type: [String], required: true, default: ["S", "M", "L", "XL", "XXL"] },
  },
  { timestamps: true }
);

export const Product = models.Product || model("Product", ProductSchema);