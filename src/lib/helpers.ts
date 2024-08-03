let index = 0;
export function createUniqueId() {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1000);
  index++;
  return `${timestamp}${random}${index}`;
}

export function getLocalUsername() {
  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "/";
  }
  return username as string;
}

export function getLocalEmail() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "/";
  }
  return email as string;
}
