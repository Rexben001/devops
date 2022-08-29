/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-globals */
import React, { Component } from "react";
import "./App.css";
import axios from "axios";

const URL = process.env.REACT_APP_API_ENDPOINT || "/api";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setBookName: "",
      setReview: "",
      fetchData: [],
      reviewUpdate: "",
    };
  }

  handleChange = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({
      [nam]: val,
    });
  };

  handleChange2 = (event) => {
    this.setState({
      reviewUpdate: event.target.value,
    });
  };

  fetchAllData = () => {
    axios.get(`${URL}/get`).then((response) => {
      this.setState({
        fetchData: response.data,
      });
    });
  };

  componentDidMount() {
    this.fetchAllData();
  }

  submit = () => {
    axios.post(`${URL}/insert`, this.state).then(() => {
      this.fetchAllData();
    });
  };

  delete = async (id) => {
    if (confirm("Do you want to delete? ")) {
      await axios.delete(`${URL}/delete/${id}`);
      this.fetchAllData();
    }
  };

  edit = async (id) => {
    await axios.put(`${URL}/update/${id}`, this.state);
    this.fetchAllData();
  };
  render() {
    let card = this.state.fetchData.map((val, key) => {
      return (
        <React.Fragment>
          <div style={{ width: "18rem" }} className="m-2">
            <div>
              <div>{val.book_name}</div>
              <div>{val.book_review}</div>
              <input
                name="reviewUpdate"
                onChange={this.handleChange2}
                placeholder="Update Review"
              ></input>
              <button
                className="m-2"
                onClick={() => {
                  this.edit(val.id);
                }}
              >
                Update
              </button>
              <button
                onClick={() => {
                  this.delete(val.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </React.Fragment>
      );
    });

    return (
      <div className="App">
        <h1>Dockerized Fullstack React Application</h1>
        <div className="form">
          <input
            name="setBookName"
            placeholder="Enter Book Name"
            onChange={this.handleChange}
          />
          <input
            name="setReview"
            placeholder="Enter Review"
            onChange={this.handleChange}
          />
        </div>
        <button className="my-2" variant="primary" onClick={this.submit}>
          Submit
        </button>{" "}
        <br />
        <br />
        <div>
          <div>{card}</div>
        </div>
      </div>
    );
  }
}
export default App;
