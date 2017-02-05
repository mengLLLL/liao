##### express-session的理解

```
//setting
app.use(session({
  secret:'foo',
  name:'meng',
  store:new MongoStore({
    url:credentials.mongo.development.connectionString
  }),
  resave:false,
  saveUninitialized:false
})); 
//set
req.session.phone = result.phone;
//get
req.session.phone
//注意都在request上面
```

##### 