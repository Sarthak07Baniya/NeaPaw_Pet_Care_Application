# Contributing to PawPaw

Thank you for your interest in contributing to NeawPaw! This document provides guidelines for contributing to the project.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Use the bug report template
3. Include steps to reproduce
4. Provide screenshots if applicable

### Suggesting Features

1. Check if the feature has been suggested
2. Describe the feature clearly
3. Explain the use case
4. Consider implementation complexity

### Pull Requests

1. Fork the repository
2. Create a feature branch (`feature/your-feature-name`)
3. Make your changes
4. Write/update tests if applicable
5. Update documentation
6. Commit with clear messages
7. Push to your fork
8. Open a pull request

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow React/React Native best practices
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure

```javascript
// Imports
import { ... } from 'react-native';

// Component
const ComponentName = ({ props }) => {
  // Hooks
  // State
  // Handlers
  // Render helpers
  
  return (
    // JSX
  );
};

export default ComponentName;

// Styles
const styles = StyleSheet.create({
  // Styles
});
```

### Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

Example: `feat: add dark mode to profile screen`

### Testing

- Test on both iOS and Android
- Verify navigation flows
- Check edge cases
- Test with different screen sizes

## Project Structure

Follow the existing structure:
- Components in `components/`
- Screens in `screens/`
- Navigation in `navigations/`
- Redux in `redux/`
- Utils in `utils/`

## Questions?

Feel free to open an issue for any questions!
