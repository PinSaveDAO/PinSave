import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Navigation } from "./components";

test("renders title", () => {
  render(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>
  );
  const linkElement = screen.getByText(/Dspyt-NFTs/i);
  expect(linkElement).toBeInTheDocument();
});
