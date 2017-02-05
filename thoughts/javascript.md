### jq自定义属性
```
html:
button(data-a="hello")
js:
$(this).data('a');
```
### splice()
> 向数组中添加／删除元素，然后返回被删除的元素，此方法回改变原始数组

```
arr.splice(index,howmany,item1.....itemN)
```

    - index是删除元素的位置（负数从数组结尾处倒着算）
    - howmany，要删除的元素数量，0的话不会删除元素
    - item1....itemN是向数组中添加的新元素