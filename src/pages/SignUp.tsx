export default function SignUp() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <section className="p-4 shadow-lg shadow-slate-400 border rounded-md">
        <form action="" className="flex flex-col gap-4 w-80">
          <div className="flex flex-col gap-1 ">
            <label htmlFor="username">Enter username</label>
            <input
              className="border p-2 rounded-sm w-full"
              type="text"
              required
              name="password"
              placeholder="username"
            />
          </div>
          <div className="flex flex-col gap-1 ">
            <label htmlFor="password">Enter password</label>
            <input
              className="border p-2 rounded-sm w-full"
              type="password"
              required
              name="password"
              placeholder="password"
            />
          </div>
          <div className="flex justify-center">
            <button className="button bg-secondary text-white px-8">
              Sign Up
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
