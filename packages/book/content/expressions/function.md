```

get_value = () -> {
  // code
}

make_options = () -> {
  name = "title"
  description = "description"

  self
}

let options = make_options()

print(options.name) // "title"

() -> {
  // code
}

valid_numbers = () -> {
  number::set(Real, Positive)
}
```
