let express = require('express');
let router = express.Router();

// mysql connection init start
const { sqlConfig } = require('../secrets/sqlconfig')

const mysql = require('mysql');
let pool = mysql.createPool(sqlConfig);
// mysql connection init end

// Buyer Functions

router.get('/', function (req, res, next) {// GET /items/?sellerName=판매자이름&search=검색어&minPrice=최소금액&maxPrice=최대금액&category=카테고리 : response로 전체 상품 중 검색 조건에 맞는 목록 [{item}, ...] 을 받아온다.
    debugger
    let sellerName = req.query.sellerName
    let search = req.query.search
    let minPrice = Number(req.query.minPrice)
    let maxPrice = Number(req.query.maxPrice)
    let category = req.query.category
    let whereArr = []
    if (!!sellerName) {
        whereArr.push(`seller_id="${sellerName}"`)
    }
    if (!!search) {
        whereArr.push(`name LIKE '%${search}%'`)
    }
    if (!!minPrice) {
        whereArr.push(`price > ${minPrice}`)
    }
    if (!!maxPrice) {
        whereArr.push(`price < ${maxPrice}`)
    }
    if (!!category) {
        whereArr.push(`category = ${category}`)
    }
    let sqlQuery = `SELECT * FROM items `
    if (whereArr.length !== 0) {
        sqlQuery = sqlQuery + "WHERE " + whereArr.join(" AND ")
    }
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
            
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    res.status(200).send(rows)
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });
            
        }
        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.get('/:buyer_id/purchased', function (req, res, next) {// GET /items/:buyer_id/purchased : response로 buyer_id에 해당하는 구매자가 구매, 입찰한 상품 목록 [{item}, ...] 을 받아온다.
    debugger
    let buyer_id = req.params.buyer_id
    let sqlQuery = `SELECT * FROM items WHERE buyer_id = '${buyer_id}' OR cur_bidder_id = '${buyer_id}' `
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
            
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    res.status(200).send(rows)
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });
            
        }
        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.get('/:buyer_id/wished', function (req, res, next) {// GET /items/:buyer_id/wished : response로 buyer_id에 해당하는 구매자가 장바구니에 담은 상품 목록 [{item}, ...] 을 받아온다.
    let buyer_id = req.params.buyer_id
    let sqlQuery = `SELECT i.* FROM items AS i JOIN wish AS w ON i.id=w.item_id where w.wisher_id = '${buyer_id}' `
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
            
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    res.status(200).send(rows)
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });
            
        }
            // 커넥션을 풀에 반환
            connection.release();
    });
});

router.post('/:buyer_id/purchased/:item_id', function (req, res, next) {// POST /items/:buyer_id/purchased/:item_id : 구매자의 구매목록에 해당 상품이 저장된다.
    debugger
    let buyer_id = req.params.buyer_id
    let item_id = req.params.item_id
    let mode = req.query.mode // 구매시 purchase, 입찰시 auction
    let price = req.body.price // 입찰 가격
    if (mode === 'purchase') {
        let sqlQuery = `UPDATE items SET buyer_id='${buyer_id}',status='soldout' where id = '${item_id}' `
        // Get Connection in Pool
        pool.getConnection(function (err, connection) {
            if (!err) {
                //connected!
                
                connection.query(sqlQuery, function (err, rows, fields) {
                    if (!err) {
                        console.log('The solution is: ', rows);
                        res.status(200).send(rows)
                    }
                    else {
                        console.log('Error while performing Query.', err);
                        res.status(500).send(err)
                    }
                });
                
            }
                // 커넥션을 풀에 반환
                connection.release();
            });
    }
    else if (mode === 'auction') { // auction
        // auction history를 작성하고, item의 cur_bidder_id를 갱신한다.
        let sqlQuery = `SELECT auction_history from items where id = '${item_id}' `
        // Get Connection in Pool
        pool.getConnection(function (err, connection) {
            if (!err) {
                //connected!
            }
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    sqlQuery = `UPDATE items SET auction_history='${rows[0].auction_history + "|" + buyer_id + "," + price}',cur_bidder_id='${buyer_id}' where id = '${item_id}' `
                    connection.query(sqlQuery, function (err, rows, fields) {
                        if (!err) {
                            console.log('The solution is: ', rows);
                            res.status(200).send(rows)
                        }
                        else {
                            console.log('Error while performing Query.', err);
                            res.status(500).send(err)
                        }
                    });
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });

            // 커넥션을 풀에 반환
            connection.release();
        });
    }
    else {
        res.status(400).send('no valid mode exist')
    }
});

router.post('/:buyer_id/wished/:item_id', function (req, res, next) {// POST /items/:buyer_id/wished/:item_id : 구매자의 장바구니에 해당 상품이 저장된다.
    let buyer_id = req.params.buyer_id
    let item_id = req.params.item_id
    let sqlQuery = `INSERT INTO wish(wisher_id, item_id)  VALUES('${buyer_id}', '${item_id}')`
    // Get Connection in Pool
    debugger
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
            
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    sqlQuery = `UPDATE items SET wished_number=wished_number+1 WHERE id='${item_id}'`
                    connection.query(sqlQuery, function (err, rows, fields) {
                        if (!err) {
                            console.log('The solution is: ', rows);
                            res.status(200).send(rows)
                        }
                        else {
                            console.log('Error while performing Query.', err);
                            res.status(500).send(err)
                        }
                    });
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });
        }
        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.delete('/:buyer_id/purchased/:item_id', function (req, res, next) { // DELETE /items/:buyer_id/purchased/:item_id : 구매자의 구매목록에서 해당 상품이 삭제된다. (frontend rule: 입찰 상태인 상품은 자신이 최신 입찰자일 때, 삭제가 불가능하다.)
    // let buyer_id = req.params.buyer_id // 현재는 필요 없다.
    let item_id = req.params.item_id
    let sqlQuery = `UPDATE items SET buyer_id='' WHERE id='${item_id}'`
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
            
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    res.status(200).send(rows)
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });
        }

        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.delete('/:buyer_id/wished/:item_id', function (req, res, next) {// DELETE /items/:buyer_id/wished/:item_id : 구매자의 장바구니에서 해당 상품이 삭제된다.
    let buyer_id = req.params.buyer_id
    let item_id = req.params.item_id
    let sqlQuery = `DELETE from wish WHERE wisher_id='${buyer_id}' AND item_id='${item_id}'`
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
            
            connection.query(sqlQuery, function (err, rows, fields) {
                if (!err) {
                    console.log('The solution is: ', rows);
                    sqlQuery = `UPDATE items SET wished_number=wished_number-1 WHERE id='${item_id}'`
                    connection.query(sqlQuery, function (err, rows, fields) {
                        if (!err) {
                            console.log('The solution is: ', rows);
                            res.status(200).send(rows)
                        }
                        else {
                            console.log('Error while performing Query.', err);
                            res.status(500).send(err)
                        }
                    });
                }
                else {
                    console.log('Error while performing Query.', err);
                    res.status(500).send(err)
                }
            });
        }


        // 커넥션을 풀에 반환
        connection.release();
    });
});



// Seller Functions

router.get('/:seller_id/registered', function (req, res, next) {// GET /items/:seller_id/registered : response로 seller_id에 해당하는 판매자가 등록한 상품 목록 [{item}, ...] 을 받아온다. (item에는 wished_number에서 장바구니에 담긴 횟수, auction_history에서 경매 기록을 확인할 수 있다 "buyer_id,price|buyer_id,price|..."가 반복되는 형식이고 늦게 입찰한 사람이 뒤에 있는 순서를 갖고 있다.)
    debugger
    let seller_id = req.params.seller_id
    let sqlQuery = `SELECT * from items WHERE seller_id='${seller_id}'`
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
        }

        connection.query(sqlQuery, function (err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
                res.status(200).send(rows)
            }
            else {
                console.log('Error while performing Query.', err);
                res.status(500).send(err)
            }
        });

        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.put('/:seller_id/registered/:item_id', function (req, res, next) {// PUT /items/:seller_id/registered/:item_id : body로 {[name:상품이름[, status:상태[, place:교환장소[, price:가격[, image:사진[, category:카테고리]]]]]]} put 가능 (경매에서 낙찰시 status만 바꾸면 됨)
    // let seller_id = req.params.seller_id // 지금은 안씀
    let item_id = req.params.item_id
    let { name, status, place, price, image, category } = req.body
    let setArr = []// set Query list
    if (name !== undefined) setArr.push(`name='${name}'`)
    if (status !== undefined) setArr.push(`status='${status}'`)
    if (place !== undefined) setArr.push(`place='${place}'`)
    if (price !== undefined) setArr.push(`price='${price}'`)
    if (image !== undefined) setArr.push(`image='${image}'`)
    if (category !== undefined) setArr.push(`category='${category}'`)
    if (setArr.length === 0) {
        res.status(400).send('there is no value to update')
        return
    }
    let sqlQuery = `UPDATE items SET ${setArr.join(',')} WHERE id='${item_id}'`
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
        }

        connection.query(sqlQuery, function (err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
                res.status(200).send(rows)
            }
            else {
                console.log('Error while performing Query.', err);
                res.status(500).send(err)
            }
        });

        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.post('/:seller_id/registered', function (req, res, next) {// POST /items/:seller_id/registered : body로 {name:상품이름, place:교환장소[, price:가격], image:사진, category:카테고리} post 가능 (price가 없을 시엔 0으로 기본 설정되고, status가 경매중으로 설정된다.)
    debugger
    let seller_id = req.params.seller_id
    // let {name, place, price, image, status, category} = req.body // 이미지 처리 구현 안됨
    let { name, place, price, status, category } = req.body
    let defaultPrice = 1
    if (price === undefined) { // auction
        status = 'auction'
        price = defaultPrice // 기본값으로 설정한다.
    }
    else { // sell
        status = status || 'sell'
    }
    // let sqlQuery = `INSERT INTO items( name, place, price, image, status, category ) VALUES('${name}', '${place}', '${price}', '${image}', '${status}', '${category}')` // 이미지 처리 현재 구현 안됨
    let sqlQuery = `INSERT INTO items(id, name, place, price, status, category, seller_id ) VALUES('${name}','${name}', '${place}', '${price}', '${status}', '${category}', '${seller_id}')`

    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
        }
        connection.query(sqlQuery, function (err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
                res.status(201).send()
            }
            else {
                console.log('Error while performing Query.', err);
                res.status(500).send(err)
            }
        });

        // 커넥션을 풀에 반환
        connection.release();
    });
});

router.delete('/:seller_id/registered/:item_id', function (req, res, next) {// DELETE /items/:seller_id/registered/item_id : 판매자가 등록한 해당 item을 삭제한다. 
    // let seller_id = req.params.seller_id // 지금은 안씀
    
    let item_id = req.params.item_id
    let sqlQuery = `DELETE from items where id='${item_id}'`
    // Get Connection in Pool
    pool.getConnection(function (err, connection) {
        if (!err) {
            //connected!
        }

        connection.query(sqlQuery, function (err, rows, fields) {
            if (!err) {
                console.log('The solution is: ', rows);
                res.status(204).send()
            }
            else {
                console.log('Error while performing Query.', err);
                res.status(500).send(err)
            }
        });

        // 커넥션을 풀에 반환
        connection.release();
    });
});












module.exports = router;