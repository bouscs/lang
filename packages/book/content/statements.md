# Statements

## let

A `let` statement adds a variable to the local scope without assigning it to the current context.

### Syntax

```
^let <scope let_assignment_scope>[expression: Expr.Assignment]</scope>$
```

Examples:

```
let first = 10
let second = "this is a string"
let third = 3 + (4 / 5)
```

## struct

A struct is a type with fields and methods.

### Priority

10

### Syntax

```
struct [ name: Symbol ] {
  [ block: Block<block_type = Statement> ]
}
```

Examples:

```
struct Point {
  x: Number
  y: Number

  fn add(other: Point) {
    Point(x + other.x, y + other.y)
  }
}

struct PlayerCharacter {
  extends Character

  name: string
  health: number
  mana: number

  event hit {
    arguments: (damage: number)

    default_effect = damage -> {
      damage_health(damage)
    }
  }

  before set health(value: number) {
    if value < 0 {
      value = 0
    }
  }

  method damage_health(magnitude: number) {
    health -= magnitude
  }

  can damage_health(magnitude: number) {
    health >= magnitude
  }
}

struct Node {
  include EventSource

  parent: Node | none

  get root {
    if parent == none {
      this
    } else {
      parent.root
    }
  }

  before dispatch_event(event: Event) {
    if(event.state == Capture & event.target == self) {
      event.state = Target

      after(once) dispatch_event(event) {
        event.state = Bubble
      }
    }
  }

  on dispatch_event(event: Event) {
    match(event.state) {
      case Capture {
        for child in children {
          child.dispatch_event(event)
        }
      }
      case Bubble | Target {
        if parent != none {
          parent.dispatch_event(event)
        }
      }
    }
  }
}
```
