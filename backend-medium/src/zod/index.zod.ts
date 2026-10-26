import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  userSignUpSchema,
  userLoginSchema,
  blogUpdateSchema,
  userInfoUpdateSchema,
  blogCreateSchema,
} from "@om_wadhi/common";
export const userSignupValidation = zValidator(
  "json",
  userSignUpSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ msg: "Invalid user information" }, 403);
    }
  }
);
export const userLoginValidation = zValidator(
  "json",
  userLoginSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ msg: "Invalid user information" }, 403);
    }
  }
);

export const userUpdateSchema = zValidator("json", userInfoUpdateSchema, (result, c) => {
  if(!result.success){
    return c.json({msg : "Invalid User Information"}, 403)
  }
})

export const createBlogSchema = zValidator(
  "json",
  blogCreateSchema,
  (result, c) => {
    if (!result.success) {
      return c.json({ msg: "Invalid input/ Missing Input" }, 403);
    }
  }
);

export const updateBlogSchema = zValidator(
  "json",
  // The published blogUpdateSchema in @om_wadhi/common still types `content` as
  // a string, but posts store TipTap JSON content (same as create). Validate the
  // editable fields locally so editing a blog's body no longer fails with 403.
  blogUpdateSchema.extend({ content: z.any().optional() }),
  (result, c) => {
    if (!result.success) {
      return c.json({ msg: "Invalid input/ Missing Input" }, 403);
    }
  }
);
