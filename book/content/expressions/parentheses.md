# Parenthesis Expression

A parenthesis expression is an expression surrounded by parenthesis.

## Priority

0

## Syntax

```
([ block: Block ])
```

Examples:

```
(1 + 2)
(1 + 2) * 3
(1 + 2) * (3 + 4)
(1, 2, 3 + 4) // (1, 2, 7)
(
  let a = 1

  a + 2, a + 3
) // (3, 4)
```

## Evaluation

A parenthesis expression evaluates to the return value of the block inside the parenthesis.

## Sets

### Returns(T)

Restricts the return type of `block` to `T`.

```

```
