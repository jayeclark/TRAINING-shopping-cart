// simulate getting products from DataBase
const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {

    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);

        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;

  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );

  // Add an item to the cart and remove it from the stock on the floor
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name == name);
    setCart([...cart, ...item]);

    // Reduce stock
    let floorStock = [...products];
    floorStock.forEach(p => p.name === name ? p.instock-- : p.instock = p.instock);
    setItems([...floorStock]);

  };

  // Delete an item from the cart and add it back to the stock on the shelf
  const deleteCartItem = (index) => {
    let product = cart.filter((item,i) => index === i)[0];
    let floorStock = [...products];
    floorStock.forEach(p => p.name == product.name ? p.instock++ : p.instock += 0);
    setItems([...floorStock]);

    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);

  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";
    if (item.instock > 0) {
      return (
        <li key={index} style={{display:"flex", margin: "10px 0px", alignItems:"center"}}>
            <Image src={photos[index % 4]} width={60} style={{flexGrow:0,flexShrink:0}}></Image>
            <div>
              <Button style={{margin: "5px", minWidth: "120px", maxHeight: "40.5px"}} variant="primary" size="large" name={item.name} type="submit" onClick={addToCart}>
                {item.name} : ${item.cost}
              </Button>
              <div style={{margin: "0px 5px", textAlign: "right", fontSize: "0.6rem"}}>{item.instock} in stock</div>
            </div>

        </li>
      );
    }

  });

  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header id={"card-header-"+index}>
        <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            <b>{item.name}</b> (1)
          </Accordion.Toggle>
        </Card.Header>

        <Accordion.Collapse
          id={"card-body-"+index} eventKey={1 + index}
        >
          <Card.Body>
            <div style={{display:"flex", alignItems: "center"}}>
              <div style={{margin:"0px 10px 0px 0px"}}>$ {item.cost} from {item.country}</div>
              <Button variant="danger" size="small" onClick={() => deleteCartItem(index)} style={{fontSize: "0.7em"}}>[Remove from Cart]</Button>
            </div>
          </Card.Body>
        </Accordion.Collapse>

        <Card.Body id={"card-body-"+index} style={{display: "none", fontSize:"0.9rem"}}>
          
          
        </Card.Body>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name} - 1
        </div>
      );
    });
    let count = <div style={{borderTop:"1px solid #666"}}>Total items in cart: {cart.length} </div>;
    return { final, total, count };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {

    doFetch(url);

    let floorStock = [...products];
    data.data.forEach(({attributes: p}) => {
      let restockedItem = floorStock.filter(item => item.name == p.name)[0]; 
      restockedItem ? restockedItem.instock += p.instock : restockedItem.instock += 0;
    });

    setItems(floorStock);

  };

  return (
    <Container>
      <Row>
        <Col style={{paddingBottom: "20px"}}>
          <h2 style={{padding:"15px 0px 5px 0px"}}>Products</h2>
          <ul style={{ listStyleType: "none", paddingLeft: "0px" }}>{list}</ul>
        </Col>
        <Col style={{paddingBottom: "20px"}}>
          <h2 style={{padding:"15px 0px 5px 0px"}}>In Your Cart</h2>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col style={{paddingBottom: "20px"}}>
          <h2 style={{padding:"15px 0px 5px 0px"}}>Check Out </h2>
          <Button variant="outline-dark" style={{minWidth:"200px"}} onClick={checkOut}>Total: $ {finalList().total}</Button>
          <div style={{margin:"5px 15px"}}>{finalList().total > 0  && finalList().final ? <><b>Cart:</b><br/></> : null }{finalList().total > 0 && finalList().final}{finalList().final.length > 1 && finalList().count} </div>
        </Col>
      </Row>
      <Row style={{border: "1px solid #ddd", padding: "20px"}}>
        <form
          style={{marginBottom: "0px"}}
          onSubmit={(event) => {
            event.preventDefault();
            restockProducts(`${query}`);
          }}
        >
          <input
            style={{margin:"5px",padding:"5px", width:"250px"}}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button style={{margin:"0px 10px"}} type="submit">Restock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));