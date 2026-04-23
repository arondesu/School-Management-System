import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the school management system title", () => {
  render(<App />);
  const heading = screen.getByText(/school management system/i);
  expect(heading).toBeInTheDocument();
});
