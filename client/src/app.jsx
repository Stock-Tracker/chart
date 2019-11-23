import React from 'react';
import ReactDOM from 'react-dom';
import Sample from '../../sampledata/price.js'
import $ from 'jquery';
import ChartHat from './charthat.jsx';
import Chart from './chart.jsx';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ticker: Sample.ticker,
      name: Sample.name,
      prices: Sample.prices,
      high: 0,
      low: 0,
      priceRange: 0,
      ratingPercent: `81%`,
      peopleOwn: 2500,
      path: 'M0 300'
    }

    this.updateTimeFrame = this.updateTimeFrame.bind(this);
    this.calculatey = this.calculateY.bind(this);
  }

  updateTimeFrame(e) {
    // TODO: need to grab the timeframe from the child elements
    let path = this.state.path;

    this.state.prices.forEach((price, i) => {
      path += ` L${i} ${this.calculateY(price.open)}`; // TODO: will need to run this for the other prices as well ...
    });

    this.setState({ path });
  }

  calculateHighAndLow(prices) {
    // determine what the highest high and lowest low is for this particular stock
    let high = prices[0].high;
    let low = prices[0].low;
    for (let i = 1; i < prices.length; i++) {
      if (prices[i].high > high) {
        high = prices[i].high;
      }
      if (prices[i].low < low) {
        low = prices[i].low;
      }
    }

    // use those numbers to determine the range for what the y-axis should be
    return [high, low];
  }

  calculateY(price) {
    // set verticalPercentFromTheBottom as (price - low) / priceRange
    const verticalPercentFromTheBottom = (price - this.state.low) / this.state.priceRange;

    // set verticalPercentFromTheTop as 1 - verticalPercentFromTheBottom
    const verticalPercentFromTheTop = 1 - verticalPercentFromTheBottom;

    return 300 * verticalPercentFromTheTop; // TODO: height will need to change if the height of the <svg> changes
  }

  componentDidMount() {
    // ajax request to the server for price data
    $.ajax({
      // TODO: fixed stock ticker for now
      url: `http://localhost:3000/price/${'ABCD'}`,
      dataType: 'json',
      success: (ticker) => {
        ticker.prices.forEach(price => {
          // converts the ISO8601 string into a Date object in the local timezone
          price.dateTime = new Date(new Date(price.dateTime).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
        });

        const highLow = this.calculateHighAndLow(ticker.prices);

        this.setState({
          ticker: ticker.ticker,
          name: ticker.name,
          prices: ticker.prices,
          high: highLow[0],
          low: highLow[1],
          priceRange: highLow[0] - highLow[1]
        });
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  render() {
    return (
      <div className="price-chart">
        <ChartHat
          ticker={this.state.ticker}
        >
        </ChartHat>
        <div className="top-right">
          <span className="rating-percent">{this.state.ratingPercent} Hold</span>
          <span className="people-own">{this.state.peopleOwn}</span>
        </div>
        <Chart path={this.state.path}></Chart>
        <div className="chart-footer">
          <div onClick={this.updateTimeFrame} className="chart-timeframes">
            <span>1D</span>
            <span>1W</span>
            <span>1M</span>
            <span>3M</span>
            <span>1Y</span>
          </div>
          <div>Expand</div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App></App>, document.querySelector('#root'));
