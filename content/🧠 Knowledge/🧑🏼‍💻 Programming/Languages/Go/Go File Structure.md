---
title: Go File Structure
tags:
  - go
  - project-layout
url: go-file-structure
---
>[!todo]
>Write note about preferred Go *file* structure, referencing *idiomatic* Go. 

## `main.go`

For a `main.go`, I prefer the main on the bottom, much like in C and other languages. Within the main function I obtain initiate the logger before delegating to a `run()` function, injecting the context, logger, and environment variable map - I make use of [caarlos0/env](https://github.com/caarlos0/env) to obtain this. This makes the program much easier to test.


```go

package main  
  
import (  
  "context"  
  "fmt"
  "github.com/caarlos0/env/v11"
  "github.com/rs/zerolog"
  "os"
  "os/signal"
  "syscall"
)  
  
type DebugCfg struct {  
  Debug bool `env:"DEBUG" envDefault:"false"`  
}  
  
// Config Environment variables
type Config struct {  
  Hostname string `env:"HOSTNAME,required"`  
  Port     int    `env:"PORT,required"`  
  Password string `env:"PASSWORD,required"`  
}  
  
func run(  
  ctx context.Context,  
  logger zerolog.Logger,  
  envMap map[string]string,  
) error {  
  
  ctx, cancel := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)  
  defer cancel()  
  
  // parse env variables with injected os.Environ()  
  cfg, err := env.ParseAsWithOptions[Config](env.Options{  
   Environment: envMap,  
  })  
  if err != nil {  
   return err  
  }  
  
  // do stuff with env vars. e.g. cfg.Hostname and wire up dependencies
  
  <-ctx.Done()  
  return err  
}  
  
func main() {  
  
  // this is the only env that should be obtained prior to run()  
  // since we want to create the logger as early as possible
  envMap := env.ToMap(os.Environ())  
  debugCfg, err := env.ParseAsWithOptions[DebugCfg](env.Options{  
   Environment: envMap,  
  })  
  if err != nil {  
   _, _ = fmt.Fprintf(os.Stderr, "failed to parse DEBUG env: %v\n", err)  
   os.Exit(1)  
  }  
  
  logger := logging.NewLogger(os.Stderr, debugCfg.Debug)  
  
  ctx := context.Background()  
  if err := run(ctx, logger, envMap); err != nil {  
   logger.Fatal().Err(err).Msg("Fatal error occurred during execution")  
  }  
}
```


## `internal/logging/logging.go`
As you can see above, I create a new logger and inject that into things instead of using it globally. I've been using [zerolog](https://github.com/rs/zerolog)lately. It is advertised as a global logger but I'm using my free will to follow the [Go proverbs](https://go-proverbs.github.io/) which state that *Clear is better than Clever*.
Here's the file:
```go
package logging  
  
import (  
  "github.com/rs/zerolog"  
  "io"
  "strings"
  "time"
)  
  
func NewLogger(out io.Writer, debug bool) zerolog.Logger {  
  
  // set level logs to caps (e.g. INFO)  
  zerolog.LevelFieldMarshalFunc = func(l zerolog.Level) string {  
   return strings.ToUpper(l.String())  
  }  
  
  level := zerolog.InfoLevel  
  
  // Human readable logs in development (debug mode)  
  var output io.Writer  
  if debug {  
   level = zerolog.DebugLevel  
   output = zerolog.ConsoleWriter{  
    Out:        out,  
    TimeFormat: time.RFC3339,  
   }  
  } else {  
   output = out  
  }  
  
  logger := zerolog.New(output).  
   Level(level).  
   With().  
   Timestamp().  
   Logger()  
  
  return logger  
}
```
## Other `.go` files

Preferred file structure is in this order:
1. Package name (obviously)
2. Imports (obviously)
3. Constants
4. Variables
5. Non-struct types
6. Free functions (not methods of a struct)
	1. Exported
	2. Non-exported
6. Interfaces
7. Structs, each followed by:
	1. "Constructor" - e.g. `func NewService()`
	2. Exported Methods
	3. Non-exported "helper" methods

The exported methods and non-exported methods should be ordered top -> down in order of how soon after the function above them they are used.

Also, if there are structs with lots of methods I will try and separate those into different files. 

> [!note] 
> I just started learning go so this will definitely change. It does seem idiomatic to define some variables above the function they're used in. We'll see



E.g `client.go`:

```go
package mypackage

import (
  "context"
  "github.com/rs/zerolog"
)

const (
  question = "life?"
  number = 42
)

var (
  globalCount int  
)

type MyCallback func(string)
type Something string

func ExportedFreeFunction(ctx context.Context, logger zerolog.Logger) error {}

func nonExportedFreeFunction(ctx context.Context, logger zerolog.Logger) error {}

type Client interface {
  ExportedMethodOne(ctx context.Context, otherArgs string) error
  ExportedMethodTwo(ctx context.Context, otherArgs string) error
}

type HTTPClient struct {
  logger zerolog.Logger
  opts ClientOptions
}

type ClientOptions struct {}

// Constructor with a bit of Liskov substitution.
// Could've returned (*HTTPClient, error) instead (which we'd do if there was no interface)
func NewHTTPClient(ctx context.Context, logger zerolog.Logger, opts ClientOptions) (Client, error) {
  return &HTTPClient{}, nil
}

func (hc *HTTPClient) ExportedMethodOne(ctx context.Context, otherArgs string) error {}
func (hc *HTTPClient) ExportedMethodTwo(ctx context.Context, otherArgs string) error {}

func (hc *HTTPClient) nonExportedMethod(ctx context.Context, otherArgs string) error {}
```

Notice that I also inject the logger rather than use it globally. The struct methods obviously don't have it passed in since it's part of the struct and can be called with `hc.logger`. 