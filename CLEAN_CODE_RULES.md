# Clean Code Rules & Guidelines

The following rules dictate the code cleaning and refactoring mission for this project. These guidelines must be strictly adhered to during all code modifications.

### 1. Component Immutability
- **DO NOT TOUCH SHADCN COMPONENTS**. All files inside the `src/components/ui` directory are strictly off-limits. Treat them as read-only.

### 2. Strict & 100% Type Safety
- Eliminate the `any` type completely. 
- You must check the TypeScript typing and write code in 100% type safety.
- Audit TypeScript declarations and replace all instances of `any` with precise, robust type definitions or interfaces. Ensure all edge cases (like `null` or `undefined` returns from APIs) are safely handled to prevent hidden TS violations.

### 3. Constant Data Extraction
- Do not hardcode static arrays, maps, or lists directly inside React components.
- If a component maps over static data, extract that array into a dedicated `.ts` file within the `src/constants/` directory. Import and use the constant array inside the component.

### 4. Strategic Component Memoization (`React.memo`)
- Use `React.memo` to optimize components, but **do not apply it blindly to all components**.
- Evaluate the rendering cost. Only wrap components in `React.memo` if they are pure components that receive identical props frequently, or if they are heavy and prone to unnecessary re-renders.

### 5. Callback & Value Optimization (`useCallback` & `useMemo`)
- Utilize the `useCallback` hook wherever appropriate to stabilize function references that are passed down as props to child components or functions that are used inside dependency arrays.
- Utilize the `useMemo` hook to cache computationally expensive calculations or to stabilize object/array references created within a component, preventing unnecessary re-calculations and re-renders.

### 6. Primitive-Only Dependencies
- **Never** include a raw object, array, or inline function directly inside a dependency array (for `useEffect`, `useMemo`, or `useCallback`). 
- If a non-primitive must be used as a dependency, it must first be stabilized using `useMemo` or `useCallback`.

### 7. Modern API Usage
- Absolutely no deprecated methods or APIs.
- If any deprecated methods from packages are found during the refactoring process, they must be updated to the latest, officially supported syntax.
