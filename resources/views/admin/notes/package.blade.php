@extends('admin.layouts.app')

@section('content')




    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <section class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1>Package</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            <li class="breadcrumb-item"><a href="#">Home</a></li>
                            <li class="breadcrumb-item active">Package</li>
                        </ol>
                    </div>
                </div>
            </div><!-- /.container-fluid -->
        </section>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">

                        <div class="card">
                            <!-- /.card-header -->
                            <div class="card-header">
                                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">
                                    Add Package
                                </button>
                                <div class="modal fade" id="myModal">
                                    <div class="modal-dialog">
                                        <div class="modal-content">

                                            <!-- Modal Header -->
                                            <div class="modal-header">
                                                <h4 class="modal-title">Add Package</h4>
                                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                                            </div>

                                            <!-- Modal body -->
                                            <div class="modal-body">
                                                <form action="{{ route('package.store') }}" method="POST"
                                                    enctype="multipart/form-data">
                                                    @csrf
                                                    <div class="form-group">
                                                        <label for="title">Price:</label>
                                                        <input type="number" class="form-control" id="title"
                                                            name="price">
                                                    </div>
                                                    <div class="form-group">
                                                        <label for="type">Type:</label>
                                                        <select class="form-control" id="type" name="type">
                                                                <option value="yearly">Yearly
                                                                <option value="monthly">Monthly
                                                                </option>

                                                        </select>
                                                    </div>
                                                    <div class="form-group">
                                                        <label for="description">Description:</label>
                                                        <textarea name="description" id="summernote" class="form-control" rows="4"></textarea>
                                                        {{-- <input type="text" class="form-control" id="description"
                                                            name="description"> --}}
                                                    </div>

                                            </div>

                                            <!-- Modal footer -->
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary"
                                                    data-dismiss="modal">Close</button>
                                                <button type="submit" class="btn btn-primary" id="saveData">Save
                                                    Data</button>
                                            </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-body">
                                <table id="example1" class="table table-bordered table-striped  ">
                                    <thead>
                                        <tr>
                                            <th>S.N</th>
                                            <th>Price</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                            <th>Uploaded</th>

                                        </tr>
                                    </thead>

                                    <tbody>
                                        @if ($package)
                                            @foreach ($package as $key => $place)
                                                <tr>
                                                    <td>{{ $key + 1 }}</td>
                                                    <td>{{ $place->price }}</td>
                                                    <td><span class="badge badge-success text-uppercase">{{ $place->type }}</span></td>
                                                    <td>{!! $place->description !!}</td>

                                                    <td>
                                                        {{ $place->updated_at->diffforhumans() }}
                                                    </td>

                                                </tr>
                                            @endforeach
                                        @endif
                                    </tbody>
                                </table>

                            </div>
                            <!-- /.card-body -->
                        </div>
                        <!-- /.card -->
                    </div>
                    <!-- /.col -->
                </div>
                <!-- /.row -->
            </div>
            <!-- /.container-fluid -->
        </section>
    </div>
@endsection
