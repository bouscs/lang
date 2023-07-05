# Filter Expression

A set filter expression narrows the type.

## Priority

9

## Syntax

```
[ symbol ]<[ Expr.SingleList<Scope(set(symbol)), All(LogicalValue(set(symbol)))> ]>
```

Examples:

```
number
string
array
number<Real, Positive>
```
