# Assignment

Assigns a value to a variable and applies it to the current context

## Priority

2

## Syntax

```
[[ key: symbol ] | [ key: Expr.VariableTypeDeclaration ]] = [ value: T ]
```

Examples:

```
my_var = 0
another_var = "this is a string"
yet_another: number | string = 3 + (4 / 5) // [Error] Type mismatch
my_set = set(number).Real // Type = set(number)
my_set: set(number) = Real, Positive
another_set: set in string = Real // [Error] Type mismatch: "Real" is not a set of "string"
```

## Evaluation

An assignment evaluates to `none`.
