import { config } from "../config";
import { userRole } from "../constant/role";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    const adminData = {
      name: "Nirob Mondal",
      email: "nirobmondal202@gmail.com",
      role: userRole.ADMIN,
      password: "pass1234"
    }

    // checking this user is exist on the db
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email
      }
    });

    // if admin already exist then throw error
    if (existingUser) {
      throw new Error("User already exist.");
    }

    // otherwise create the admin
    const response = await fetch(`${config.betterAuthUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Origin": config.frontendUrl
      },
      body: JSON.stringify(adminData)
    })

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    console.log("Admin created successfully:", data);

  } catch (error) {
    console.log("Error occured: ", error);
  }
}

seedAdmin();