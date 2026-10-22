import { useEffect, useState } from "react";
import { Desk } from "./components/Desk.jsx";

export function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("pb-portfolio-theme") === "dark");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("pb-portfolio-theme", dark ? "dark" : "light");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#080a0e" : "#f1f2f5");
  }, [dark]);

  return (
    <>
      <a className="skip" href="#stage">Skip to desk</a>
      <Desk dark={dark} onToggleTheme={() => setDark((value) => !value)} />
    </>
  );
}
