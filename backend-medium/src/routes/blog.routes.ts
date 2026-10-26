import { Hono } from "hono";
import { createBlogSchema, updateBlogSchema } from "../zod/index.zod";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { prismaInstance } from "../prismaInstance";
import { RefreshAccessToken } from "../controllers/access.refresh";

const router = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    ACCESSTOKEN_SECRET: string;
    REFRESHTOKEN_SECRET: string;
    GEMINI_API_KEY: string;
  };
  Variables: {
    userId: string;
  };
}>();

// creating middleware to extract user id to store the blog related to that user
router.use("*", async (c, next) => {
  const { prisma } = prismaInstance(c);
  try {
    const accessToken = getCookie(c, "accessToken");
    if (!accessToken) {
      // refresh token logic
      const refreshToken = getCookie(c, "refreshToken");
      if (!refreshToken) {
        return c.json({ msg: "Access Denied" }, 401);
      }
      try {
        const verified = await verify(refreshToken, c.env.REFRESHTOKEN_SECRET);
        const { id } = verified;

        // Fetch user from the database
        const user = await prisma.user.findUnique({
          where: { id: id as string },
          select: { id: true, username: true, email: true, verified: true },
        });

        if (!user) {
          return c.json({ msg: "User not found" }, 404);
        }
        // assigning new accessToken
        RefreshAccessToken({
          c,
          user: {
            username: user.username,
            email: user.email,
            id: user.id,
            verified: user.verified as boolean,
          },
          ACCESSTOKEN_SECRET: c.env.ACCESSTOKEN_SECRET,
        });
        c.set("userId", user.id);
        await next();
      } catch (e) {
        return c.json({ msg: "Invalid refresh token" }, 401);
      }
    } else {
      const user = await verify(accessToken, c.env.ACCESSTOKEN_SECRET);
      c.set("userId", user.id as string);
      await next();
    }
  } catch (e) {
    return c.json({ msg: "Token expired. Please Login" }, 401);
  }
});

router.post("/createBlog", createBlogSchema, async (c) => {
  const userId = c.get("userId");
  // initializing prisma client
  const { prisma } = prismaInstance(c);

  // zod validation for user schema
  const data = c.req.valid("json");
  const { title, content, brief, tag } = data;

  // imageURL is optional and not part of the published Zod schema — read it from raw body
  const rawBody = await c.req.json().catch(() => ({} as Record<string, unknown>));
  const imageURL = typeof rawBody["imageURL"] === "string" && rawBody["imageURL"].trim() ? rawBody["imageURL"].trim() : null;

  // creating new post
  const blog = await prisma.post.create({
    data: {
      title: title,
      content: content,
      brief: brief,
      imageURL: imageURL,
      author_id: userId,
      postTag: tag,
      publishedAt: new Date().toDateString(),
    },
    select: {
      id: true,
      title: true,
      brief: true,
      content: true,
      author: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      publishedAt: true,
    },
  });
  // on success message
  return c.json({ msg: "success", blogs: { blog } }, 200);
});

// to update
router.put("/updateBlog", updateBlogSchema, async (c) => {
  const userId = c.get("userId");
  const { prisma } = prismaInstance(c);

  // validating data
  const data = c.req.valid("json");

  // lets create a dataObject that contains only the user updated data field
  type Update = {
    title?: string;
    brief?: string;
    content?: string;
  };

  const updateBlogObj: Update = {};
  if (data.title) updateBlogObj.title = data.title;
  if (data.content) updateBlogObj.content = data.content;
  if (data.brief) updateBlogObj.brief = data.brief;
  await prisma.post.update({
    where: {
      id: data.blogId,
      author_id: userId,
    },
    data: {
      title: data.title,
      content: data.content,
      brief: data.brief,
    },
  });

  // imageURL is not in blogUpdateSchema — read separately from raw body
  const rawBody = await c.req.json().catch(() => ({} as Record<string, unknown>));
  if (typeof rawBody["imageURL"] === "string" && rawBody["imageURL"].trim()) {
    await prisma.post.update({
      where: { id: data.blogId },
      data: { imageURL: rawBody["imageURL"].trim() },
    });
  } else if (rawBody["imageURL"] === null) {
    // explicitly cleared
    await prisma.post.update({
      where: { id: data.blogId },
      data: { imageURL: null },
    });
  }

  return c.json({ msg: "Blog updated successfully " });
});

// delete a blog (only by its author)
router.delete("/deleteBlog/:id", async (c) => {
  const { prisma } = prismaInstance(c);
  const userId = c.get("userId");
  const id = c.req.param("id");

  // make sure the post exists and belongs to the caller before deleting
  const post = await prisma.post.findUnique({
    where: { id },
    select: { author_id: true },
  });
  if (!post) return c.json({ msg: "Blog not found" }, 404);
  if (post.author_id !== userId)
    return c.json({ msg: "Not authorized to delete this blog" }, 403);

  // the schema has no onDelete cascade, so clear dependent rows first
  await prisma.$transaction([
    prisma.savedBlogs.deleteMany({ where: { postId: id } }),
    prisma.upvotes.deleteMany({ where: { postId: id } }),
    prisma.dislikes.deleteMany({ where: { postId: id } }),
    prisma.post.delete({ where: { id } }),
  ]);

  return c.json({ msg: "Blog deleted successfully" });
});

// return a specific blog from the database
router.get("/id/:id", async (c) => {
  // initializing prisma client
  const { prisma } = prismaInstance(c);
  // author id is userId currently logged-in
  const userId = c.get("userId");
  // getting blog id
  const blogId = c.req.param("id");
  // creating new post
  const blog = await prisma.post.findUnique({
    where: {
      id: blogId,
    },
    select: {
      id: true,
      title: true,
      brief: true,
      content: true,
      imageURL: true,
      postTag: true,
      summary: true,
      publishedAt: true,
      SavedBlogs: {
        where: {
          userId: userId,
        },
        select: {
          postId: true,
        },
      },
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          Followers: {
            select: {
              followingIds: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });
  // please check the logic to add this to the  request in Readme
  const follower = blog?.author.Followers.filter((obj) => {
    if (obj.followingIds?.id === userId) {
      return userId;
    }
    return;
  });

  const blogPost = {
    ...blog,
    isSaved: blog?.SavedBlogs.length === 1 ? true : false,
    isFollower: follower?.length !== 0 ? true : false,
  };
  // on success message
  return c.json({ blog: blogPost }, 200);
});

// populate all blogs
router.get("/bulk", async (c) => {
  // initializing prisma client
  const { prisma } = prismaInstance(c);
  const userId = c.get("userId");
  const { cursor, limit = "5" } = c.req.query();
  const query = {
    take: parseInt(limit),
    select: {
      id: true,
      title: true,
      brief: true,
      content: true,
      imageURL: true,
      publishedAt: true,
      postTag: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      SavedBlogs: {
        where: { userId: userId },
        select: {
          postId: true,
        },
      },
    },
  };
  const cursorQuery = {
    take: parseInt(limit),
    skip: 1,
    cursor: {
      id: cursor,
    },
    select: {
      id: true,
      title: true,
      brief: true,
      content: true,
      imageURL: true,
      publishedAt: true,
      postTag: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
      SavedBlogs: {
        where: { userId: userId },
        select: {
          postId: true,
        },
      },
    },
  };
  // getting all the blogs for home screen
  // using cursor-based pagination for quick and efficient fetches.
  // read Readme.md to know more about cursor based pagination and why and how is it used here.
  const allBlog = await prisma.post.findMany(cursor ? cursorQuery : query);
  if (allBlog.length === 0) {
    return c.json({ msg: "No blogs are posted", hasData: null }, 200);
  }

  return c.json(
    {
      msg: "success",
      allBlog,
      nextCursor: allBlog.length === 5 ? allBlog[allBlog.length - 1].id : null,
      hasMore: allBlog.length === parseInt(limit),
    },
    200
  );
});

router.get("/searchBlog", async (c) => {
  // initializing prisma client
  const { prisma } = prismaInstance(c);

  try {
    const { search } = c.req.query();
    const blog = await prisma.post.findMany({
      where: {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
    });
    return c.json({ msg: "success", blog });
  } catch (e) {
    return c.json({ msg: "Internal server error" }, 500);
  }
});

//saving blogs
router.post("/save/:id", async (c) => {
  try {
    const { prisma } = prismaInstance(c);
    const postId = c.req.param("id");
    const userId = c.get("userId");
    const result = await prisma.$transaction(async (tsx) => {
      const alreadySaved = await tsx.savedBlogs.findFirst({
        where: {
          postId: postId,
          userId: userId,
        },
        select: {
          id: true,
        },
      });
      if (alreadySaved) {
        const deleteSavedId = await tsx.savedBlogs.delete({
          where: {
            postId_userId: {
              postId: postId,
              userId: userId,
            },
          },
        });
        return { saved: false };
      } else {
        const createSavedId = await tsx.savedBlogs.create({
          data: {
            userId: userId,
            postId: postId,
          },
        });
        return { saved: true };
      }
    });
    return c.json({ msg: "success", postSaved: result.saved }, 200);
  } catch (e) {
    return c.json({ msg: "Internal Server Error" }, 500);
  }
});

// getting saved blogs by the user
router.get("/savedBlogs", async (c) => {
  try {
    const { prisma } = prismaInstance(c);
    const userId = c.get("userId");

    const savedBlogs = await prisma.savedBlogs.findMany({
      where: {
        userId: userId,
      },
      select: {
        post: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return c.json({ msg: "success", savedBlogs }, 200);
  } catch (e) {
    return c.json({ msg: "Internal Server Error" }, 500);
  }
});

router.post("/upvote", async (c) => {
  const userId = c.get("userId");
  const { prisma } = prismaInstance(c);
  const blogId = c.req.query("blogId");
  try {
    // initially i've created 2 transaction 1 for deleting and other for creating upvote.But to avoid the race conditions, i've bundled them in single transaction & which is also useful to reduce the roundtrips to the database. "tsx" means a single transaction for the whole conditional i.e a single roundtrip to the db server.
    const result = await prisma.$transaction(async (tsx) => {
      const existingLike = await prisma.upvotes.findUnique({
        where: {
          userId_postId: {
            // since we have declare the userId & the postId as unique
            userId: userId,
            postId: blogId as string,
          },
        },
      });
      if (existingLike) {
        // removing user's upvote from the upvote model for that particular post and then decrementing like

        const deleteUpvoteId = await tsx.upvotes.delete({
          // deletes the user like from the upvotes field of the user.
          where: {
            userId_postId: {
              userId: userId,
              postId: blogId as string,
            },
          },
        });
        const devote = await tsx.post.update({
          // decrements the likeCount for post by 1
          where: {
            id: blogId,
          },
          data: {
            likeCount: { decrement: 1 },
          },
          select: {
            likeCount: true,
          },
        });

        const data = {
          isLiked: false,
          likeCount: devote.likeCount,
        };
        return data;
      } else {
        // making an entry for the user liked post and incrementing the likeCount by 1 for that post
        const createUpvoteId = await tsx.upvotes.create({
          data: {
            userId: userId,
            postId: blogId as string,
          },
        });
        const upvote = await tsx.post.update({
          where: {
            id: blogId,
          },
          data: {
            likeCount: { increment: 1 },
          },
          select: {
            likeCount: true,
          },
        });

        const data = {
          isLiked: true,
          likeCount: upvote.likeCount,
        };
        return data;
      }
    });
    return c.json({ msg: "success", result }, 200);
  } catch (e) {
    return c.json({ msg: "Internal Server Issue" }, 500);
  }
});
// toggle a dislike for a post (mirrors /upvote, independent counter)
router.post("/disvote", async (c) => {
  const userId = c.get("userId");
  const { prisma } = prismaInstance(c);
  const blogId = c.req.query("blogId");
  try {
    const result = await prisma.$transaction(async (tsx) => {
      const existingDislike = await tsx.dislikes.findUnique({
        where: {
          userId_postId: { userId, postId: blogId as string },
        },
      });
      if (existingDislike) {
        // remove the dislike and decrement the count
        await tsx.dislikes.delete({
          where: { userId_postId: { userId, postId: blogId as string } },
        });
        const post = await tsx.post.update({
          where: { id: blogId },
          data: { dislikeCount: { decrement: 1 } },
          select: { dislikeCount: true },
        });
        return { isDisliked: false, dislikeCount: post.dislikeCount };
      }
      // create the dislike and increment the count
      await tsx.dislikes.create({ data: { userId, postId: blogId as string } });
      const post = await tsx.post.update({
        where: { id: blogId },
        data: { dislikeCount: { increment: 1 } },
        select: { dislikeCount: true },
      });
      return { isDisliked: true, dislikeCount: post.dislikeCount };
    });
    return c.json({ msg: "success", result }, 200);
  } catch (e) {
    return c.json({ msg: "Internal Server Issue" }, 500);
  }
});

router.post("/metadata", async (c) => {
  const { prisma } = prismaInstance(c);
  const userId = c.get("userId");
  //  is an array of ids seperated in batches
  const { blogId } = await c.req.json();
  const ids = blogId.map((item: { id: string }) => item.id);

  try {
    const metadata = await prisma.post.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        likeCount: true,
        dislikeCount: true,
        SavedBlogs: {
          where: {
            userId: userId,
          },
          select: {
            postId: true,
          },
        },
      },
    });
    const blogMetadata = metadata.map((blogdata) => {
      return {
        ...blogdata,
        isSaved: blogdata.SavedBlogs.length >= 1 ? true : false,
      };
    });
    return c.json({ msg: "success", blogMetadata }, 200);
  } catch (e) {
    return c.json({ msg: "Internal Server errror" }, 500);
  }
});
// Recursively pulls readable plain text out of the TipTap JSON document
// so the summarizer only sees prose, not markup/node structure.
const extractText = (content: any): string => {
  const out: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;
    if (node.type === "text" && typeof node.text === "string") out.push(node.text);
    else if (node.type === "hardBreak") out.push("\n");
    if (node.content) walk(node.content);
    if (
      node.type === "paragraph" ||
      node.type === "heading" ||
      node.type === "blockquote" ||
      node.type === "codeBlock" ||
      node.type === "listItem"
    )
      out.push("\n");
  };
  walk(content);
  return out.join("").replace(/\n{3,}/g, "\n\n").trim();
};

// AI article summarizer (Google Gemini) with per-post caching in the DB.
// First call generates + stores the summary; later calls return the cached one.
router.post("/summarize/:id", async (c) => {
  const { prisma } = prismaInstance(c);
  const postId = c.req.param("id");
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, brief: true, content: true, summary: true },
    });
    if (!post) return c.json({ msg: "Post not found" }, 404);

    // cache hit -> return stored summary without spending quota
    if (post.summary) {
      return c.json({ msg: "success", summary: post.summary, cached: true }, 200);
    }

    const plainText = extractText(post.content);
    if (plainText.trim().length < 40) {
      return c.json({ msg: "Article too short to summarize", summary: null }, 200);
    }

    const article =
      `${post.title}\n${post.brief ? post.brief + "\n" : ""}${plainText}`.slice(0, 15000);

    const prompt =
      "You are an expert editor. Summarize the article below in 3-4 concise " +
      "sentences that capture the core idea and key takeaways. Use plain prose, " +
      "no bullet points, no preamble or title. Article:\n\n" +
      article;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${c.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error", geminiRes.status, errText);
      return c.json({ msg: "Summarizer failed. Verify GEMINI_API_KEY." }, 502);
    }

    const data: any = await geminiRes.json();
    const summary: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) return c.json({ msg: "Empty summary returned" }, 502);

    // persist so subsequent reads are instant and free
    await prisma.post.update({ where: { id: postId }, data: { summary } });
    return c.json({ msg: "success", summary, cached: false }, 200);
  } catch (e) {
    console.error("summarize error", e);
    return c.json({ msg: "Internal Server Error" }, 500);
  }
});

export default router;
