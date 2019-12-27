import React from "react";
import { Location } from "history";
import { Link, NavLink } from "react-router-dom";
import { TITLE_PREFIX } from "../../utils/constants";
import { useState, useEffect, useCallback } from "react";
import { CONTEST_MODE } from "../../data/source/constants";

const NAV_ITEMS = [
  ["最近役满", "highlight"],
  ["排行榜", "ranking"],
  ["大数据", "statistics"]
].map(([label, path]) => ({ label, path }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isActive(match: any, location: Location): boolean {
  if (!match) {
    return false;
  }
  return !NAV_ITEMS.some(({ path }) => location.pathname.startsWith("/" + path));
}

export default function Navbar() {
  const [mobileVisible, setMobileVisible] = useState(false);
  const onToggleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setMobileVisible(!mobileVisible);
    },
    [mobileVisible, setMobileVisible]
  );
  useEffect(() => {
    if (!mobileVisible) {
      return;
    }
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains("navbar-toggler")) {
        return;
      }
      setMobileVisible(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [mobileVisible, setMobileVisible]);
  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          {TITLE_PREFIX}
        </Link>
        {!CONTEST_MODE && (
          <>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNavAltMarkup"
              aria-controls="navbarNavAltMarkup"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={onToggleButtonClick}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className={`collapse navbar-collapse justify-content-end ${mobileVisible ? "" : "d-none"} d-lg-block`}
              id="navbarNavAltMarkup"
            >
              <div className="navbar-nav">
                <NavLink className="nav-item nav-link" activeClassName="active" to="/" isActive={isActive}>
                  主页
                </NavLink>
                {NAV_ITEMS.map(({ label, path }) => (
                  <NavLink key={path} className="nav-item nav-link" activeClassName="active" to={`/${path}`}>
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
