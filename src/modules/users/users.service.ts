import { prisma } from "../../lib/prisma";

// ── Get My Profile ────────────────────────────────────────────
const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      image: true,
      role: true,
      sellerProfile: true,
    },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  return user;
};

// ── Update My Profile ─────────────────────────────────────────
interface UpdateProfileInput {
  name?: string;
  phone?: string;
  address?: string;
  image?: string;
}

const updateMyProfile = async (userId: string, data: UpdateProfileInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  // Only pick allowed fields
  const updateData: UpdateProfileInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.image !== undefined) updateData.image = data.image;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      image: true,
      role: true,
      sellerProfile: true,
    },
  });

  return updated;
};

export const userService = {
  getMyProfile,
  updateMyProfile,
};