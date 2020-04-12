Sarina-DI
=========

![build-and-test](https://github.com/SarinaJs/sarina-di/workflows/build-and-test/badge.svg)
[![npm version](https://badge.fury.io/js/%40sarina%2Fdi.svg)](https://badge.fury.io/js/%40sarina%2Fdi)

A dependency injection for Typescript.

> The package is part of `@Sarina` framework

## Installtion

Install by `yarn`

```sh
yarn add @sarina/di
```

Modify your `tsconfig.json` to include the following settings
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Quick Start

```ts

import { ServiceCollection, IServiceProvider, injectable } from '@sarina/di';

@injectable()
class MyService {
	public constructor(private readonly myService: MySeccondService) {}

	public getName() {
		return this.myService.name;
	}
}
@injectable()
class MySeccondService {
	public name: string;
}

const bootstrap = async () => {
	// registring services
	const serviceContainer = new ServiceCollection();
	serviceContainer.addTransientClass(MyService);
	serviceContainer.addSingletonClass(MySeccondService);

	// resolving
	const serviceProvider: IServiceProvider = await serviceContainer.build();
	const myService = await serviceProvider.get<MyService>(MyService);
	const name = myService.getName();
	console.log(`The name is ${name}`);
};

bootstrap()
	.then()
	.catch();

```

# API

Sarina-Di performs `constructor` injection on the constructors of decorated classes.

## Decorators

### injectable()
Class decorator factory that allows the class dependencies to be injected at runtime.

#### Usage
```ts
import { injectable } from '@sarina/di';

@injectable()
class MyService {
	public name: string;
}

```

### inject()
Parameter decorator factory that allows for interface and other non-class information to be stored in the constructor's metadata.

#### Usage
```ts
import { inject } from '@sarina/di';

export ILOGGER_TOKEN=symbol('ILogger');
interface ILogger{}

@injectable()
class MyService {
    public constructor(@inject(ILOGGER_TOKEN) logger:ILogger)
}
```

### optional()
Parameter decorator factory that allows null injection if no service found to inject.

#### Usage
```ts
import { optional } from '@sarina/di';

export ILOGGER_TOKEN=symbol('ILogger');
interface ILogger{}

@injectable()
class MyService {
    public constructor(@optional() @inject(ILOGGER_TOKEN) logger:ILogger)
}
```

### multiple()
Parameter decorator for array parameters where the array contents will come from the provider. It will inject an array using the specified injection token to resolve the values.

#### Usage
```ts
import { multiple } from '@sarina/di';

export ILOGGER_TOKEN=symbol('ILogger');
interface ILogger{}

@injectable()
class MyService {
    public constructor(@multiple() @optional() @inject(ILOGGER_TOKEN) loggers:ILogger[])
}
```

## ServiceContainer
In order for yourservices to be used, they need to be registered with the service-collection. Registrations take the form of a Token/Provider pair, so we need to take a brief diversion to discuss tokens and providers.

### Token
A token may be either a string, a symbol, or a class constructor.

```ts
export type Token<T = any> = Type<T> | string | symbol;

const myToken='my-token';
const myToken2=Symbol('my-Token');
const myToken=class MyService{}
```

### Providers
A provider is registered with the DI collection and provides the information needed to resolve an instance for a given token. In our implementation, we have the following 4 provider types:

#### Class Provider
```ts
import { ServiceCollection, ServiceLifeTime } from '@sarina/di';

new ServiceContainer()
    .addClass(TheClass, ServiceLifeTime.transient)
    // Or
    .addTransientClass(TheClass)
    // Or singletone
    .addSingletonClass(TheClass)
    // Or Scoped
    .addScopedClass(TheClass);
```

also you can define class provider by passing custom `token`:

```ts
import { ServiceCollection, ServiceLifeTime, Token } from '@sarina/di';

const myToken:Token = Symbol('MySevice');

new ServiceContainer()
    .addClass(myToken, TheClass, ServiceLifeTime.transient)
    // Or
    .addTransientClass(myToken, TheClass)
    // Or singletone
    .addSingletonClass(myToken, TheClass)
    // Or Scoped
    .addScopedClass(myToken, TheClass);
```

#### Value Provider
This provider is used to resolve a token to a given value. This is useful for registering constants, or things that have a already been instantiated in a particular way.

```ts
import { ServiceCollection, ServiceLifeTime, Token } from '@sarina/di';

const myToken:Token = Symbol('MySevice');

new ServiceContainer()
    .addValue(myToken, 'my-value');
```

#### Factory provider
This provider is used to resolve a token using a given factory. The factory has full access to the serviceProvider.

```ts
import { ServiceCollection, ServiceLifeTime, Token } from '@sarina/di';

const myToken:Token = Symbol('MySevice');

class MyService {
    constructor(name:string){}
}

new ServiceContainer()
    .addValue('name', 'ivan');
    .addFactory(myToken, ServiceLifeTime.transient, async (provider)=> new MyService( await provider.get('name') ) )
    // Or
    .addTransientFactory(myToken, async (provider)=> new MyService( await provider.get('name') ) )
    // Or
    .addSingletonFactory(myToken, async (provider)=> new MyService( await provider.get('name') ) )
    // Or
    .addScopedFactory(myToken, async (provider)=> new MyService( await provider.get('name') ) )
```

## Resolution
Resolution is the process of exchanging a token for an instance. ServiceProvider will recursively fulfill the dependencies of the token being resolved in order to return a fully constructed object.

The resolution process is responsible of `IServiceProvider` service. By using `build` method of `IServiceContainer` you will get a ServiceProvider.
```ts
import { ServiceCollection, IServiceProvider, ServiceLifeTime, Token } from '@sarina/di';
const provider:IServiceProvider = new ServiceCollection()
    ....
    .build();
```

The typical way that an object is resolved is from the container using `get()`.
```ts
import { ServiceCollection, IServiceProvider, ServiceLifeTime, Token, injectable } from '@sarina/di';

const MYSERVICE_TOKEN=Symbol('MyService');

@injectable()
class MyService {

}

const serviceProvider : IServiceProvider = new ServiceCollection()
    .addSingletonClass(MyService)
    .addSingletonClass(MYSERVICE_TOKEN, (p)=>p.get(MyService)) // using existing instance
    .addSingletonClass('my-token', (p)=>p.get(MyService)); // using existing instance

const myService = serviceProvider.get('my-token');
const myService = serviceProvider.get(MYSERVICE_TOKEN);
const myService = serviceProvider.get(MyService);
```

You can also resolve all instances registered against a given token with `getAll()`.

```ts
import { ServiceCollection, IServiceProvider, ServiceLifeTime, Token, injectable } from '@sarina/di';

const VALUES_TOKEN=Symbol('values');

const serviceProvider : IServiceProvider = new ServiceCollection()
    .addValue(VALUES_TOKEN,'A')
    .addValue(VALUES_TOKEN,'B')
    .addValue(VALUES_TOKEN,'C')
    .build();

const values:string[] = serviceProvider.getAll(VALUES_TOKEN);
```

## Lifetime

The `sarina-di` allows you to define 3 type of lifetime:

  - **singleton**: Any `singleton` services will be instantied per `IServiceProvider` and will shared across all other providers.

  - **scoped**: Any `scoped` service will be instantied per `ScopedProvider`.

  - **transient**: Any `transient` service will be instantied per `resolution` request.


In order to create a scoped provider, you can use `createScope` of `IServiceProvider` instance.

```ts
const serviceProvider : IServiceProvider = ...
const scopedProvider = serviceProvider.createScope();
```

# How to contribute
Just fork the project, make your changes send us a PR.
