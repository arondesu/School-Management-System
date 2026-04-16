import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the school systems dashboard heading", () => {
  render(<App />);
  const heading = screen.getByText(/school systems dashboard/i);
  expect(heading).toBeInTheDocument();
});
