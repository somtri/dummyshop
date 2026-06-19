const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const token = process.env.ADMIN_RESET_TOKEN || "change-me";

async function run() {
  const health = await fetch(`${baseUrl}/api/health`).then((r) => r.json());
  console.log("health", health);

  const reset = await fetch(`${baseUrl}/api/admin/reset`, {
    method: "POST",
    headers: { "x-admin-token": token }
  }).then((r) => r.json());
  console.log("reset", reset);

  const verify = await fetch(`${baseUrl}/api/admin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify({
      taskId: "shop_001",
      expect: { cartQuantity: 0 }
    })
  }).then((r) => r.json());
  console.log("verify", verify);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
