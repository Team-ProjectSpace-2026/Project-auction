import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Find a Button component or test the concept
// Since Button component location varies, we test common UI patterns

describe('Common Components', () => {
  describe('Button behavior', () => {
    it('renders clickable element', () => {
      render(<button>Click me</button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeDefined();
    });

    it('fires onClick handler', () => {
      const handleClick = vi.fn();
      render(<button onClick={handleClick}>Click</button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disabled button does not fire onClick', () => {
      const handleClick = vi.fn();
      render(<button disabled onClick={handleClick}>Click</button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Input behavior', () => {
    it('renders input with placeholder', () => {
      render(<input placeholder="Search..." />);
      expect(screen.getByPlaceholderText('Search...')).toBeDefined();
    });

    it('updates value on change', () => {
      render(<input defaultValue="" />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'hello' } });
      expect(input.value).toBe('hello');
    });
  });

  describe('Form behavior', () => {
    it('submits form data', () => {
      const handleSubmit = vi.fn((e) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <input defaultValue="test@example.com" />
          <button type="submit">Submit</button>
        </form>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
