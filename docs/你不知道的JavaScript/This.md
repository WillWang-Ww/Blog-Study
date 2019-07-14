---
title:This
---

# This

>任何足够先进的技术都和魔法无异。——Arthur C. Clarke

我喜欢这句话。

### 关于this

函数执行需要一个上下文,可以选择显式传递,也可以用this.
```
显式传递:
function identify(context) {
  return context.name.toUpperCase();
}

function speak(context) {
var greeting = "Hello, I'm " + identify( context );
console.log( greeting );
}

identify( you ); // READER
speak( me ); //hello, 我是KYLE
```

用**this引用自身**的场景：递归、自解除绑定的事件处理器

想要记录一下 foo 被调用的次数：
```
function foo(num) {
  console.log( "foo: " + num );
  // 记录foo 被调用的次数
  this.count++;  //无意中创建了一个值为NaN的全局变量count
  // 思路1.重新声明一个data，然后 data.count++   ---词法作用域
  // 思路2.通过一个指向函数对象的词法标识符（变量，人话就是函数名）来引用函数自身 foo.count++
}

//思路1 ：var data = { count: 0 }

foo.count = 0;

var i;

for (i=0; i<10; i++) {
  if (i > 5) {
    foo( i );
    //思路3.强制绑定this指向foo  foo.call( foo,i )
  }
}

// foo: 6
// foo: 7
// foo: 8
// foo: 9
// foo 被调用了多少次？
console.log( foo.count ); // 0 -- WTF?
```

this在任何情况下都不指向函数的词法作用域。

作用域存在于JavaScript引擎内部。

this是在运行时绑定的，**只取决于函数的调用方式（调用位置）。**

### OK，那什么是调用位置？

就是函数是在哪里被调用的，可以看作是一个函数调用链。举个简单例子：
```
function baz() {
  // 当前调用栈是：baz
  // 因此，当前调用位置是全局作用域
  console.log( "baz" );
  bar(); // <-- bar 的调用位置
}

function bar() {
  this全面解析 ｜ 83
  // 当前调用栈是baz -> bar
  // 因此，当前调用位置在baz 中
  console.log( "bar" );
  foo(); // <-- foo 的调用位置
}
```

### 绑定规则
**1.默认绑定**
```
function foo() {
  console.log( this.a );
}

var a = 2;

foo(); // 2
```
foo() 是直接使用不带任何修饰的函数引用进行调用的，故函数调用时应用了this 的默认绑定，因此this 指向全局对象。
严格模式下与 foo() 调用位置无关，均为undefined

**2.隐式绑定**
```
function foo() {
  console.log( this.a );
}

var obj = {
  a: 2,
  foo: foo
};

obj.foo(); // 2
```
调用时，会使用obj上下文来调用foo， this.a = obj.a

隐式丢失：隐式绑定丢失绑定对象，使用默认绑定：

1.直接引用foo函数本身
```
//接上
var bar = obj.foo; // 函数别名！
var a = "oops, global"; // a 是全局对象的属性
bar(); // "oops, global"
```

2.传入回调函数：参数传递是隐式赋值
```
function foo() {
console.log( this.a );
}
function doFoo(fn) {
// fn 其实引用的是foo
fn(); // <-- 调用位置！
}
var obj = {
a: 2,
foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
doFoo( obj.foo ); // "oops, global"

//setTimeout( obj.foo, 100 ); // "oops, global"  调用内置的函数也是一样的结果
```
私货：
考虑执行方法的时候是直接 **方法名()**，还是 **对象.方法名()** 。如果是传参就是第一种，参数传值，传的是fn的地址，**所以只要是直接调用的回调，执行的时候就是 方法名() , this 就是默认赋值。**

3.在一些流行的JavaScript 库中事件处理器常会把回调函数的this 强制绑定到触发事件的DOM 元素上。

**3.显式绑定**
1.call 、apply
```
从绑定this的角度来说，二者是一样的。

function foo() {
console.log( this.a );
}
var obj = {
a:2
};
foo.call( obj ); // 2  如果传入原始值，则会转换成对象形式 如 new String()
```
2.硬绑定：bind
```
function foo() {
console.log( this.a );
}
var obj = {
a:2
};
var bar = function() {
foo.call( obj );    //看，绑的多么的硬
};
bar(); // 2
setTimeout( bar, 100 ); // 2
// 硬绑定的bar 不可能再修改它的this
bar.call( window ); // 2
```
典型应用场景：

---创建包裹函数，传入所有参数并返回接受到的所有值
```
function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}

var obj = {
a:2
};

var bar = function() {
  return foo.apply( obj, arguments );   //看，又来了，绑的多么的硬，还返回了参数
};

var b = bar( 3 ); // 2 3   绑定了 obj 且返回参数
console.log( b ); // 5     执行　this.a +　argument
```
---创建一个可以重复使用的辅助函数
```
function bind(fn, obj) {
  return function() {
    return fn.apply( obj, arguments );
    };
}
//简单的辅助绑定函数
```
ES5 之后，内置 Function.prototype.bind 来达到这个效果
```
//接上文。 bind( ... ) 返回一个硬绑定的新函数，参数---> this 的上下文，并调用原始函数
var bar = foo.bind( obj );
```
**4.new绑定**
前置知识：
构造函数：使用new操作符时被调用的函数，会初始化创建的新对象。
new一个函数会发生下面的操作：
创建一个全新的对象
将这个新对象执行“原型”连接
这个新对象会绑定到函数调用的this
如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个新对象。
绑定this优先级： new > 显式 > 隐式

**综合一下，如果想要判断this**

**1 . new绑定。函数是否在new中调用？ ---> 是的话this绑定的是新创建的对象**

**var bar = new foo()**

**2 . 显式绑定。函数是否通过call、apply、bind绑定？ ---> 是对话this绑定的是赋予的那个上下文对象**

**var bar = foo.call(obj2)**

**3 . 隐式绑定。函数是否在某个上下文中被调用？ ---> 是的话this绑定那个上下文对象**

**var bar = obj1.foo()**

**4 . 以上都不是，则使用默认绑定。非严格模式下绑定全局对象，严格模式下绑定 undefined**

**var bar = foo()**

如果把null 或者undefined 作为this 的绑定对象传入call、apply 或者bind，这些值在调用时会被忽略，实际应用的是默认绑定规则。非要这么做的话（想让this为空），建议将this绑定到一个 DMZ （demilitarized zone）对象上。这样就不会对全局产生影响。
```
// 我们的DMZ 空对象
var ø = Object.create( null );
```
软绑定实现：
```
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function(obj) {
    var fn = this;
    // 捕获所有 curried 参数
    var curried = [].slice.call( arguments, 1 );
    var bound = function() {
      return fn.apply(
         (!this || this === (window || global)) ?
            obj : this
            curried.concat.apply( curried, arguments )
          );
        };
    bound.prototype = Object.create( fn.prototype );
    return bound;  
  };
}
```
**箭头函数会继承外层函数调用的this 绑定（无论this 绑定到什么）**